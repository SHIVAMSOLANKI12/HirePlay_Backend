import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findInterviewProcessWithRounds } from "../repositories/interview.repository.js";
import { createFeedback, findFeedbackByInterviewer } from "../repositories/feedback.repository.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";

/**
 * Orchestrates the creation of interview feedback.
 */
export const createFeedbackWorkflow = async (user, interviewId, data) => {
  // 1. Fetch & Verify Interview
  const interview = await verifyInterviewAccess(user, interviewId);

  // 3. Status check: Can't submit feedback on CANCELLED interviews
  if (interview.status === "CANCELLED") {
    throw new AppError("Cannot submit feedback for a cancelled interview", 400);
  }

  return await prisma.$transaction(async (tx) => {
    // 4. Check for duplicate feedback
    const existingFeedback = await findFeedbackByInterviewer(interview.id, user.id, tx);
    
    if (existingFeedback) {
      throw new AppError("You have already submitted feedback for this interview round. Use the update endpoint instead.", 400);
    }

    // 5. Create Feedback
    const feedback = await createFeedback({
      interviewId: interview.id,
      interviewerId: user.id,
      overallRating: data.overallRating,
      recommendation: data.recommendation,
      technicalScore: data.technicalScore,
      communicationScore: data.communicationScore,
      problemSolvingScore: data.problemSolvingScore,
      cultureFitScore: data.cultureFitScore,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      notes: data.notes,
    }, tx);

    // 6. Log Domain Events
    await logApplicationActivity({
      applicationId: interview.applicationId,
      performedBy: user.id,
      action: "INTERVIEW_FEEDBACK_SUBMITTED",
      metadata: { 
        interviewId: interview.id,
        feedbackId: feedback.id,
        recommendation: feedback.recommendation,
        overallRating: feedback.overallRating
      },
    }, tx);

    eventEngine.emit(ACTIVITY_EVENTS.INTERVIEW_FEEDBACK_SUBMITTED, {
      userId: interview.candidateId,
      companyId: interview.companyId,
      entityId: interview.id,
      performedByRole: user.role,
      newValue: { title: "Interview Feedback Submitted", description: `Feedback has been submitted for interview "${interview.title}".` },
      metadata: { feedbackId: feedback.id, recommendation: feedback.recommendation, overallRating: feedback.overallRating }
    });

    return feedback;
  });
};
