import AppError from "../../../utils/AppError.js";
import { findOfferById } from "../repositories/offer.repository.js";
import { getTimeline } from "../repositories/offerAudit.repository.js";
import { toTimelineListDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const getOfferTimelineWorkflow = async (user, offerId) => {
  // Only HR or COMPANY_ADMIN can view full timeline
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const events = await getTimeline(offerId);
  return toTimelineListDTO(events);
};
