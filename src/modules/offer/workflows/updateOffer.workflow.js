import AppError from "../../../utils/AppError.js";
import { findOfferById, updateOffer } from "../repositories/offer.repository.js";
import { toOfferDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const updateOfferWorkflow = async (user, offerId, data) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const updateData = {
    ...data,
    updatedById: user.id
  };

  if (updateData.joiningDate) {
    updateData.joiningDate = new Date(updateData.joiningDate);
  }
  if (updateData.validUntil) {
    updateData.validUntil = new Date(updateData.validUntil);
  }

  const updatedOffer = await updateOffer(offerId, updateData);

  return toOfferDTO(updatedOffer);
};
