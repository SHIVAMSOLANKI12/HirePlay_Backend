import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";
import { findInterviewHistory } from "../repositories/lifecycle.repository.js";

/**
 * Orchestrates fetching the audit history for an interview.
 */
export const getInterviewHistoryWorkflow = async (user, interviewId) => {
  // 1. Fetch & Verify Interview
  const interview = await verifyInterviewAccess(user, interviewId);

  // 3. Fetch History
  return await findInterviewHistory(interviewId);
};
