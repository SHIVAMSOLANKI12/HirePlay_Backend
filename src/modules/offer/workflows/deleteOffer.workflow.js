import AppError from "../../../utils/AppError.js";
import { findOfferById, deleteOffer } from "../repositories/offer.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const deleteOfferWorkflow = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  await deleteOffer(offerId, user.id);

  return { success: true, message: "Offer deleted successfully" };
};
