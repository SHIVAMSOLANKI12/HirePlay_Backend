import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { getFeedbackSummary, isEligibleForOffer } from "../repositories/decision.repository.js";

/**
 * Orchestrates fetching the decision state and feedback summary of an interview.
 */
export const getDecisionWorkflow = async (user, interviewId) => {
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

  // 3. Fetch Summary and Offer Eligibility
  const feedbackSummary = await getFeedbackSummary(interviewId);
  const eligibleForOffer = await isEligibleForOffer(interviewId);

  return {
    decision: interview.decision,
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
