import AppError from "../../../utils/AppError.js";
import { getCandidateOffers } from "../repositories/offer.repository.js";
import { toCandidateOfferListDTO } from "../mappers/offer.mapper.js";

export const getCandidateOffersWorkflow = async (user) => {
  const offers = await getCandidateOffers(user.id);
  return toCandidateOfferListDTO(offers);
};
