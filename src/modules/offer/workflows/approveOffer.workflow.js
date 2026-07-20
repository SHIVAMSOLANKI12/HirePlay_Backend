import AppError from "../../../utils/AppError.js";
import { findOfferById, approveOffer } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { validateOfferExists, validateOfferStatus } from "../services/offer.validation.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";

export const approveOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN") {
    throw new AppError("Access denied. Only Company Admins can approve offers.", 403);
  }

  const existingOffer = await findOfferById(offerId);
  validateOfferExists(existingOffer);
  validateOfferStatus(existingOffer, ["DRAFT"]);

  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const updatedOffer = await approveOffer(offerId, user.id);

  eventEngine.emit(ACTIVITY_EVENTS.OFFER_APPROVED, {
    userId: user.id,
    companyId: existingOffer.job.companyId || existingOffer.companyId,
    entityId: updatedOffer.id,
    performedByRole: user.role,
    oldValue: { status: existingOffer.status },
    newValue: { status: updatedOffer.status, title: "Offer Approved", description: `Offer has been approved.` },
    metadata: { applicationId: existingOffer.applicationId, jobId: existingOffer.jobId }
  });

  await logOfferTimeline(
    offerId,
    "APPROVED",
    "Offer Approved",
    "Offer was approved and is now ready to be sent.",
    user
  );

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.OFFER_APPROVED, {
    companyId: existingOffer.job.companyId || existingOffer.companyId,
    userId: existingOffer.createdById, // Notify the person who drafted it
    type: "OFFER",
    channel: "EMAIL",
    title: "Offer Approved",
    message: `Offer for ${existingOffer.application?.candidate?.firstName || 'Candidate'} has been approved.`,
    metadata: { offerId: updatedOffer.id },
    eventName: NOTIFICATION_EVENTS.OFFER_APPROVED,
    CandidateName: existingOffer.application?.candidate?.firstName || "Candidate",
    JobTitle: existingOffer.jobTitle,
  });

  return toOfferStatusDTO(updatedOffer);
};
