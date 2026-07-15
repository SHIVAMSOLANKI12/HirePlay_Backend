import AppError from "../../../utils/AppError.js";
import { getCandidateOffer, acceptOffer, checkAndMarkOfferExpired } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import prisma from "../../../config/prisma.js";

export const acceptOfferWorkflow = async (user, offerId, data) => {
  if (user.role !== "CANDIDATE") {
    throw new AppError("Access denied. Only candidates can accept offers.", 403);
  }

  const existingOffer = await getCandidateOffer(user.id, offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found or you don't have permission to access it.", 404);
  }

  const processedOffer = await checkAndMarkOfferExpired(existingOffer);

  if (processedOffer.status !== "SENT") {
    throw new AppError(`Cannot accept offer. Current status is ${processedOffer.status}. Only SENT offers can be accepted.`, 400);
  }

  if (existingOffer.validUntil < new Date()) {
    throw new AppError("Cannot accept this offer as it has expired.", 400);
  }

  const updatedOffer = await acceptOffer(offerId, data.message || "");

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: existingOffer.companyId,
      applicationId: existingOffer.applicationId,
      jobId: existingOffer.jobId,
      type: "OFFER_ACCEPTED",
      title: "Offer Accepted",
      description: `Candidate has accepted the offer.`,
      metadata: { offerId: updatedOffer.id, message: data.message }
    }
  });

  return toOfferStatusDTO(updatedOffer);
};
