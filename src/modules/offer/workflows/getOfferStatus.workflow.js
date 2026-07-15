import AppError from "../../../utils/AppError.js";
import { findOfferById, checkAndMarkOfferExpired } from "../repositories/offer.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { toOfferExpiryStatusDTO } from "../mappers/offer.mapper.js";

export const getOfferStatusWorkflow = async (user, offerId) => {
  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Allow recruiters with access, OR the candidate themselves
  if (user.role !== "CANDIDATE") {
    await verifyRecruiterJobAccess(user, existingOffer.jobId);
  } else if (existingOffer.candidateId !== user.id) {
    throw new AppError("Offer not found", 404); // Hide existence
  }

  // Trigger expiry check
  const processedOffer = await checkAndMarkOfferExpired(existingOffer);

  const isExpired = processedOffer.status === "EXPIRED" || processedOffer.validUntil < new Date();
  const eligible = processedOffer.status === "SENT" && !isExpired;

  return toOfferExpiryStatusDTO(processedOffer, isExpired, eligible);
};
