import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { updateInterviewDecision, getFeedbackSummary, isEligibleForOffer } from "../repositories/decision.repository.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { createActivityLog } from "../../activity/services/activityLog.service.js";

/**
 * Orchestrates updating the decision of an interview process.
 */
export const updateDecisionWorkflow = async (user, interviewId, data) => {
  // 1. Fetch Interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { job: true },
  });

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  // 2. Verify Ownership
  await verifyRecruiterJobAccess(user, interview.jobId);

  // 3. Status Rules
  if (interview.status === "CANCELLED") {
    throw new AppError("Cannot update decision for a cancelled interview", 400);
  }
  
  if (data.decision === "NEXT_ROUND" && interview.isFinalRound) {
    throw new AppError("Cannot select NEXT_ROUND for an interview marked as the final round", 400);
  }

  // 4. Transaction
  const updatedInterview = await prisma.$transaction(async (tx) => {
    // 4.a Update Decision
    const updated = await updateInterviewDecision(interviewId, data.decision, data.notes, tx);

    // 4.b Log Application Activity
    await logApplicationActivity({
      applicationId: interview.applicationId,
      performedBy: user.id,
      action: "INTERVIEW_DECISION_UPDATED",
      metadata: {
        interviewId: interview.id,
        decision: data.decision,
        notes: data.notes,
      },
    }, tx);

    // 4.c Log Activity for Timeline/Dashboard
    await createActivityLog({
      userId: interview.candidateId,
      companyId: interview.companyId,
      applicationId: interview.applicationId,
      jobId: interview.jobId,
      type: "INTERVIEW_DECISION_UPDATED",
      title: `Interview Decision: ${data.decision.replace("_", " ")}`,
      description: `Decision updated to ${data.decision} for interview "${interview.title}".`,
      metadata: { interviewId: interview.id, decision: data.decision },
    }, tx);

    return updated;
  });

  // 5. Fetch Summary
  const feedbackSummary = await getFeedbackSummary(interviewId);
  const eligibleForOffer = await isEligibleForOffer(interviewId);

  return {
    decision: updatedInterview.decision,
    eligibleForOffer,
    feedbackSummary: feedbackSummary || {
      overallAverageRating: 0,
      technicalAverage: 0,
      communicationAverage: 0,
      problemSolvingAverage: 0,
      cultureFitAverage: 0,
      recommendationSummary: "PENDING"
    }
  };
};
