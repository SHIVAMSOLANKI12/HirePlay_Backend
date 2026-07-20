import AppError from "../../../utils/AppError.js";
import { getCandidateOffer, acceptOffer, checkAndMarkOfferExpired } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { validateOfferExists, validateOfferStatus, validateOfferNotExpired, validateOfferNotRevoked } from "../services/offer.validation.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";

export const acceptOfferWorkflow = async (user, offerId, data) => {
  let offer = await getCandidateOffer(user.id, offerId);
  validateOfferExists(offer);
  validateOfferNotRevoked(offer);
  validateOfferNotExpired(offer);
  validateOfferStatus(offer, ["SENT"]);

  // Auto-expiry check
  offer = await checkAndMarkOfferExpired(offer);
  validateOfferNotExpired(offer);

  const updatedOffer = await acceptOffer(offerId, data.message || "");

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      jobId: offer.jobId,
      type: "OFFER_ACCEPTED",
      title: "Offer Accepted",
      description: `Candidate has accepted the offer.`,
      metadata: { offerId: updatedOffer.id, message: data.message }
    }
  });

  await logOfferTimeline(
    offerId,
    "ACCEPTED",
    "Offer Accepted",
    "Candidate has accepted the offer.",
    user
  );

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.OFFER_ACCEPTED, {
    companyId: offer.companyId,
    userId: offer.createdById, // Notify the person who created the offer
    type: "OFFER",
    channel: "EMAIL",
    title: "Offer Accepted",
    message: `Candidate ${user.firstName} has accepted the job offer.`,
    metadata: { offerId: updatedOffer.id },
    eventName: NOTIFICATION_EVENTS.OFFER_ACCEPTED,
    CandidateName: user.firstName,
    JobTitle: offer.jobTitle,
    OfferJoiningDate: new Date(offer.joiningDate).toLocaleDateString(),
  });

  return toOfferStatusDTO(updatedOffer);
};
