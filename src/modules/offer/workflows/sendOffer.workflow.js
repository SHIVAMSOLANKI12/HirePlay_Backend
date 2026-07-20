import AppError from "../../../utils/AppError.js";
import { findOfferById, sendOffer } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { validateOfferExists, validateOfferStatus } from "../services/offer.validation.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";

export const sendOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  validateOfferExists(existingOffer);
  validateOfferStatus(existingOffer, ["APPROVED"]);

  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const updatedOffer = await sendOffer(offerId, user.id);

  eventEngine.emit(ACTIVITY_EVENTS.OFFER_SENT, {
    userId: user.id,
    companyId: existingOffer.companyId,
    entityId: updatedOffer.id,
    performedByRole: user.role,
    oldValue: { status: existingOffer.status },
    newValue: { status: updatedOffer.status, title: "Offer Sent", description: `Offer has been sent to candidate.` },
    metadata: { applicationId: existingOffer.applicationId, jobId: existingOffer.jobId }
  });

  await logOfferTimeline(
    offerId,
    "SENT",
    "Offer Sent",
    "Offer has been sent to the candidate.",
    user
  );

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.OFFER_SENT, {
    companyId: existingOffer.companyId,
    userId: existingOffer.candidateId, // Send email to candidate
    type: "OFFER",
    channel: "EMAIL",
    title: "Job Offer",
    message: `You have received a job offer for ${existingOffer.jobTitle}.`,
    metadata: { offerId: updatedOffer.id },
    eventName: NOTIFICATION_EVENTS.OFFER_SENT,
    CandidateName: existingOffer.application?.candidate?.firstName || "Candidate",
    CompanyName: existingOffer.company?.name || "HirePlay",
    JobTitle: existingOffer.jobTitle,
    OfferSalary: `${existingOffer.currency} ${existingOffer.salary}`,
    OfferJoiningDate: new Date(existingOffer.joiningDate).toLocaleDateString(),
    OfferLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/offers/${updatedOffer.id}`
  });

  return toOfferStatusDTO(updatedOffer);
};
