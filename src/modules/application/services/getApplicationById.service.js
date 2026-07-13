import AppError from "../../../utils/AppError.js";
import { findApplicationByIdAndCandidateId } from "../repositories/application.repository.js";

export const getApplicationByIdService = async (applicationId, candidateId) => {
  const application = await findApplicationByIdAndCandidateId(applicationId, candidateId);

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  return application;
};
