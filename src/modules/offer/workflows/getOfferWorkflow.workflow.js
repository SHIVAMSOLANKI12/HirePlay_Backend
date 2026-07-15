import AppError from "../../../utils/AppError.js";
import { findWorkflow } from "../repositories/offer.repository.js";
import { toWorkflowDTO } from "../mappers/offer.mapper.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const getOfferWorkflowDetails = async (user, offerId) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  const workflow = await findWorkflow(offerId);
  if (!workflow) {
    throw new AppError("Offer not found", 404);
  }

  // Verify access
  await verifyRecruiterJobAccess(user, workflow.jobId);

  return toWorkflowDTO(workflow);
};
