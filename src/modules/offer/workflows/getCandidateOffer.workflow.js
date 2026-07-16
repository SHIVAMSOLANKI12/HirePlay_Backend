import AppError from "../../../utils/AppError.js";
import { getCandidateOffer, checkAndMarkOfferExpired } from "../repositories/offer.repository.js";
import { toCandidateOfferDTO } from "../mappers/offer.mapper.js";
import { validateOfferExists } from "../services/offer.validation.service.js";

export const getCandidateOfferWorkflow = async (user, offerId) => {
  const offer = await getCandidateOffer(user.id, offerId);
  validateOfferExists(offer);

  const processedOffer = await checkAndMarkOfferExpired(offer);

  return toCandidateOfferDTO(processedOffer);
};
