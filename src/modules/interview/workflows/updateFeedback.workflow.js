import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { updateFeedback, findFeedbackByInterviewer } from "../repositories/feedback.repository.js";

/**
 * Orchestrates the updating of interview feedback.
 */
export const updateFeedbackWorkflow = async (user, interviewId, data) => {
  // 1. Fetch the specific interview round
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { job: true },
  });

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  // 2. Verify Ownership
  await verifyRecruiterJobAccess(user, interview.jobId);

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
