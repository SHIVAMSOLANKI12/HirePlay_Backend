import AppError from "../../../utils/AppError.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { findInterviewProcessWithRounds } from "../repositories/interview.repository.js";

/**
 * Orchestrates fetching an interview process and its rounds.
 */
export const getInterviewRoundsWorkflow = async (user, interviewId) => {
  const interviewProcess = await findInterviewProcessWithRounds(interviewId);
  
  if (!interviewProcess) {
    throw new AppError("Interview process not found", 404);
  }

  // Verify Ownership
  await verifyRecruiterJobAccess(user, interviewProcess.jobId);

  return interviewProcess;
};
