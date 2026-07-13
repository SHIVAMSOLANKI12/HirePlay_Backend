import AppError from "../../../utils/AppError.js";
import { findApplicationByIdAndCandidateId, withdrawApplication } from "../repositories/application.repository.js";
import { WITHDRAW_ALLOWED_STATUSES } from "../constants/application.constants.js";

export const withdrawApplicationService = async (applicationId, candidateId) => {
  // 1. Fetch application and ensure it belongs to the candidate
  const application = await findApplicationByIdAndCandidateId(applicationId, candidateId);

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Check if the status allows withdrawal
  if (!WITHDRAW_ALLOWED_STATUSES.includes(application.status)) {
    throw new AppError("Application cannot be withdrawn at the current stage.", 409);
  }

  // 3. Perform withdrawal
  const updatedApplication = await withdrawApplication(applicationId);

  return updatedApplication;
};
