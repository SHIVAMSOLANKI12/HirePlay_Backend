import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { findFeedbacksByInterview } from "../repositories/feedback.repository.js";

/**
 * Orchestrates fetching all feedbacks for an interview.
 */
export const getInterviewFeedbacksWorkflow = async (user, interviewId) => {
  // 1. Fetch the interview to verify access
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { job: true },
  });

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  // 2. Verify Ownership
  await verifyRecruiterJobAccess(user, interview.jobId);

  // 3. Fetch all feedbacks
  const feedbacks = await findFeedbacksByInterview(interviewId);
  
  return feedbacks;
};
