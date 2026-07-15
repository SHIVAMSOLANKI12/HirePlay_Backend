import AppError from "../../../utils/AppError.js";
import { findOfferById, approveOffer } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import prisma from "../../../config/prisma.js";

export const approveOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN") {
    throw new AppError("Access denied. Only Company Admins can approve offers.", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  if (existingOffer.status !== "DRAFT") {
    throw new AppError(`Cannot approve offer in ${existingOffer.status} state. Only DRAFT offers can be approved.`, 400);
  }

  const updatedOffer = await approveOffer(offerId, user.id);

  // In a real scenario, you'd add an activity log here using prisma.$transaction
  // Or handle it in an async event emitter
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: existingOffer.job.companyId || existingOffer.companyId,
      applicationId: existingOffer.applicationId,
      jobId: existingOffer.jobId,
      type: "OFFER_APPROVED",
      title: "Offer Approved",
      description: `Offer has been approved.`,
      metadata: { offerId: updatedOffer.id }
    }
  });

  return toOfferStatusDTO(updatedOffer);
};
