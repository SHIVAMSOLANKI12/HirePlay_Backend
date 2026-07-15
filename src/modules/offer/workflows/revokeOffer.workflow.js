import AppError from "../../../utils/AppError.js";
import { findOfferById, revokeOffer } from "../repositories/offer.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import prisma from "../../../config/prisma.js";

export const revokeOfferWorkflow = async (user, offerId, data) => {
  if (user.role !== "COMPANY_ADMIN") {
    throw new AppError("Access denied. Only COMPANY_ADMIN can revoke offers.", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const allowedStatuses = ["DRAFT", "APPROVED", "SENT"];
  if (!allowedStatuses.includes(existingOffer.status)) {
    throw new AppError(`Cannot revoke offer. Current status is ${existingOffer.status}. Only DRAFT, APPROVED, or SENT offers can be revoked.`, 400);
  }

  const updatedOffer = await revokeOffer(offerId, user.id, data.reason || "");

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: existingOffer.companyId,
      applicationId: existingOffer.applicationId,
      jobId: existingOffer.jobId,
      type: "OFFER_REVOKED",
      title: "Offer Revoked",
      description: `Offer was revoked by company admin.`,
      metadata: { offerId: updatedOffer.id, reason: data.reason }
    }
  });

  return toOfferStatusDTO(updatedOffer);
};
