import AppError from "../../../utils/AppError.js";
import { findOfferById, approveOffer } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { validateOfferExists, validateOfferStatus } from "../services/offer.validation.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";

export const approveOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN") {
    throw new AppError("Access denied. Only Company Admins can approve offers.", 403);
  }

  const existingOffer = await findOfferById(offerId);
  validateOfferExists(existingOffer);
  validateOfferStatus(existingOffer, ["DRAFT"]);

  await verifyRecruiterJobAccess(user, existingOffer.jobId);

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

  await logOfferTimeline(
    offerId,
    "APPROVED",
    "Offer Approved",
    "Offer was approved and is now ready to be sent.",
    user
  );

  return toOfferStatusDTO(updatedOffer);
};
