import AppError from "../../../utils/AppError.js";
import { getCandidateOffer } from "../repositories/offer.repository.js";
import { toCandidateOfferDTO } from "../mappers/offer.mapper.js";

export const getCandidateOfferWorkflow = async (user, offerId) => {
  if (user.role !== "CANDIDATE") {
    throw new AppError("Access denied. Only candidates can access these offers.", 403);
  }

  const offer = await getCandidateOffer(user.id, offerId);
  if (!offer) {
    throw new AppError("Offer not found or you don't have permission to view it.", 404);
  }

  return toCandidateOfferDTO(offer);
};
