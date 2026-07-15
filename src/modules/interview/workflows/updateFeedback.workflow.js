import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";
import { updateFeedback, findFeedbackByInterviewer } from "../repositories/feedback.repository.js";

/**
 * Orchestrates updating an existing interview feedback.
 */
export const updateFeedbackWorkflow = async (user, interviewId, data) => {
  // 1. Fetch & Verify Interview
  const interview = await verifyInterviewAccess(user, interviewId);

  // 3. Find existing feedback for this interviewer
  const existingFeedback = await findFeedbackByInterviewer(interview.id, user.id);
  
  if (!existingFeedback) {
    throw new AppError("Feedback not found or you are not the original author.", 404);
  }

  // 4. Update Feedback
  const feedback = await updateFeedback(existingFeedback.id, {
    overallRating: data.overallRating,
    recommendation: data.recommendation,
    technicalScore: data.technicalScore !== undefined ? data.technicalScore : undefined,
    communicationScore: data.communicationScore !== undefined ? data.communicationScore : undefined,
    problemSolvingScore: data.problemSolvingScore !== undefined ? data.problemSolvingScore : undefined,
    cultureFitScore: data.cultureFitScore !== undefined ? data.cultureFitScore : undefined,
    strengths: data.strengths !== undefined ? data.strengths : undefined,
    weaknesses: data.weaknesses !== undefined ? data.weaknesses : undefined,
    notes: data.notes !== undefined ? data.notes : undefined,
  });

  return feedback;
};
