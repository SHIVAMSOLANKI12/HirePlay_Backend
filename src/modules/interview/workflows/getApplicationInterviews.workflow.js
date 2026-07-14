import AppError from "../../../utils/AppError.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { findApplicationById } from "../../application/repositories/application.repository.js";
import { findRootInterviewsByApplication } from "../repositories/interview.repository.js";

/**
 * Orchestrates fetching all interview processes for a specific application.
 */
export const getApplicationInterviewsWorkflow = async (user, applicationId) => {
  // 1. Fetch application to check it exists and get jobId
  const application = await findApplicationById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Ownership
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Fetch Root Interviews
  const interviewProcesses = await findRootInterviewsByApplication(applicationId);
  
  return interviewProcesses;
};
