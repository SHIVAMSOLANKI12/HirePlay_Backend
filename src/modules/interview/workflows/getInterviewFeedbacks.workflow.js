import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";
import { findFeedbacksByInterview } from "../repositories/feedback.repository.js";

/**
 * Orchestrates fetching all feedbacks for an interview.
 */
export const getInterviewFeedbacksWorkflow = async (user, interviewId) => {
  // 1. Fetch & Verify Interview
  const interview = await verifyInterviewAccess(user, interviewId);

  // 3. Fetch all feedbacks
  const feedbacks = await findFeedbacksByInterview(interviewId);
  
  return feedbacks;
};
