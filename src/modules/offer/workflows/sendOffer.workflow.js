import AppError from "../../../utils/AppError.js";
import { findOfferById, sendOffer } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { validateOfferExists, validateOfferStatus } from "../services/offer.validation.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";

export const sendOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  validateOfferExists(existingOffer);
  validateOfferStatus(existingOffer, ["APPROVED"]);

  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const updatedOffer = await sendOffer(offerId, user.id);

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      companyId: existingOffer.companyId,
      applicationId: existingOffer.applicationId,
      jobId: existingOffer.jobId,
      type: "OFFER_SENT",
      title: "Offer Sent",
      description: `Offer has been sent to candidate.`,
      metadata: { offerId: updatedOffer.id }
    }
  });

  await logOfferTimeline(
    offerId,
    "SENT",
    "Offer Sent",
    "Offer has been sent to the candidate.",
    user
  );

  return toOfferStatusDTO(updatedOffer);
};
