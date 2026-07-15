import AppError from "../../../utils/AppError.js";
import { getCandidateOffer, rejectOffer, checkAndMarkOfferExpired } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import prisma from "../../../config/prisma.js";

export const rejectOfferWorkflow = async (user, offerId, data) => {
  if (user.role !== "CANDIDATE") {
    throw new AppError("Access denied. Only candidates can reject offers.", 403);
  }

  const existingOffer = await getCandidateOffer(user.id, offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found or you don't have permission to access it.", 404);
  }

  const processedOffer = await checkAndMarkOfferExpired(existingOffer);

  if (processedOffer.status !== "SENT") {
    throw new AppError(`Cannot reject offer. Current status is ${processedOffer.status}. Only SENT offers can be rejected.`, 400);
  }

  const updatedOffer = await rejectOffer(offerId, data.reason || "");

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: existingOffer.companyId,
      applicationId: existingOffer.applicationId,
      jobId: existingOffer.jobId,
      type: "OFFER_REJECTED",
      title: "Offer Rejected",
      description: `Candidate has rejected the offer.`,
      metadata: { offerId: updatedOffer.id, reason: data.reason }
    }
  });

  return toOfferStatusDTO(updatedOffer);
};
