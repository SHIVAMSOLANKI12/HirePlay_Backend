import AppError from "../../../utils/AppError.js";
import { findOfferById } from "../repositories/offer.repository.js";
import { getAuditLogs } from "../repositories/offerAudit.repository.js";
import { toAuditLogListDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const getOfferAuditWorkflow = async (user, offerId) => {
  // Only HR or COMPANY_ADMIN can view audit logs
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const existingOffer = await findOfferById(offerId);
  if (!existingOffer) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, existingOffer.jobId);

  const logs = await getAuditLogs(offerId);
  return toAuditLogListDTO(logs);
};
