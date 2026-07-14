import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { findInterviewProcessWithRounds } from "../repositories/interview.repository.js";
import { createFeedback, findFeedbackByInterviewer } from "../repositories/feedback.repository.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { createActivityLog } from "../../activity/services/activityLog.service.js";

/**
 * Orchestrates the creation of interview feedback.
 */
export const createFeedbackWorkflow = async (user, interviewId, data) => {
  // 1. Fetch the specific interview round
  // To verify job access, we need to find the interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { job: true },
  });

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  // 2. Verify Ownership (Recruiter must own the Job)
  await verifyRecruiterJobAccess(user, interview.jobId);

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

    await createActivityLog({
      userId: interview.candidateId,
      companyId: interview.companyId,
      applicationId: interview.applicationId,
      jobId: interview.jobId,
      type: "INTERVIEW_FEEDBACK_SUBMITTED",
      title: `Feedback Submitted for Round ${interview.roundNumber}`,
      description: `An interviewer has submitted feedback for Round ${interview.roundNumber} (${interview.title}).`,
      metadata: { interviewId: interview.id, feedbackId: feedback.id },
    }, tx);

    return feedback;
  });
};
