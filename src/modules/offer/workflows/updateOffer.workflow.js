import AppError from "../../../utils/AppError.js";
import { findOfferById, updateOffer } from "../repositories/offer.repository.js";
import { toOfferDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { trackOfferChanges, logOfferTimeline } from "../services/offerAudit.service.js";
import prisma from "../../../config/prisma.js";

export const updateOfferWorkflow = async (user, offerId, data, req) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const result = await prisma.$transaction(async (tx) => {
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

    const updatedOffer = await updateOffer(offerId, updateData, tx);

    await trackOfferChanges(offerId, existingOffer, updatedOffer, user, req, tx);
    
    await logOfferTimeline(
      offerId,
      "UPDATED",
      "Offer Details Updated",
      "Offer details were updated by the recruiter.",
      user,
      tx
    );

    return updatedOffer;
  });

  return toOfferDTO(result);
};
