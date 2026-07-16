import AppError from "../../../utils/AppError.js";
import { findOfferById, sendOffer, isOfferReadyToSend } from "../repositories/offer.repository.js";
import { toOfferStatusDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";

export const sendOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const ready = await isOfferReadyToSend(offerId);
  if (!ready) {
    throw new AppError(`Cannot send offer. Current status is ${existingOffer.status}. Offer must be APPROVED first.`, 400);
  }

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
