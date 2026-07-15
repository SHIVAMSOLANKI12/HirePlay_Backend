import AppError from "../../../utils/AppError.js";
import { getCandidateOffers } from "../repositories/offer.repository.js";
import { toCandidateOfferListDTO } from "../mappers/offer.mapper.js";

export const getCandidateOffersWorkflow = async (user) => {
  if (user.role !== "CANDIDATE") {
    throw new AppError("Access denied. Only candidates can access these offers.", 403);
  }

  const offers = await getCandidateOffers(user.id);
  return toCandidateOfferListDTO(offers);
};
