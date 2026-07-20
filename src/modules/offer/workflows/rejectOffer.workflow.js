import AppError from "../../../utils/AppError.js";
import { getCandidateOffer, rejectOffer, checkAndMarkOfferExpired } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { validateOfferExists, validateOfferStatus, validateOfferNotExpired, validateOfferNotRevoked } from "../services/offer.validation.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";

export const rejectOfferWorkflow = async (user, offerId, data) => {
  let offer = await getCandidateOffer(user.id, offerId);
  validateOfferExists(offer);
  validateOfferNotRevoked(offer);
  validateOfferNotExpired(offer);
  validateOfferStatus(offer, ["SENT"]);

  // Auto-expiry check
  offer = await checkAndMarkOfferExpired(offer);
  validateOfferNotExpired(offer);

  const updatedOffer = await rejectOffer(offerId, data.reason || "");

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      jobId: offer.jobId,
      type: "OFFER_REJECTED",
      title: "Offer Rejected",
      description: `Candidate has rejected the offer.`,
      metadata: { offerId: updatedOffer.id, reason: data.reason }
    }
  });

  await logOfferTimeline(
    offerId,
    "REJECTED",
    "Offer Rejected",
    "Candidate has rejected the offer.",
    user
  );

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.OFFER_REJECTED, {
    companyId: offer.companyId,
    userId: offer.createdById, // Notify the person who created the offer
    type: "OFFER",
    channel: "EMAIL",
    title: "Offer Declined",
    message: `Candidate ${user.firstName} has declined the job offer.`,
    metadata: { offerId: updatedOffer.id },
    eventName: NOTIFICATION_EVENTS.OFFER_REJECTED,
    CandidateName: user.firstName,
    JobTitle: offer.jobTitle,
  });

  return toOfferStatusDTO(updatedOffer);
};
