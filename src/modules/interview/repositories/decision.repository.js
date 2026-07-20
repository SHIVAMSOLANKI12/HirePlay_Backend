import prisma from "../../../config/prisma.js";

/**
 * Updates the decision of an interview process.
 */
export const updateInterviewDecision = async (id, decision, decisionNotes, tx = prisma) => {
  const data = {
    decision,
    decisionNotes,
  };

  if (decision === "SELECTED" || decision === "REJECTED") {
    data.status = "COMPLETED";
    data.completedAt = new Date();
  }

  return tx.interview.update({
    where: { id },
    data,
    select: {
      id: true,
      decision: true,
      status: true,
      applicationId: true,
      companyId: true,
      candidateId: true,
      jobId: true,
      title: true,
    }
  });
};

/**
 * Determines if the interview process has a SELECTED decision,
 * meaning the candidate is eligible for an offer.
 * This is a reusable helper for the upcoming Offer Module.
 */
export const isEligibleForOffer = async (interviewId, tx = prisma) => {
  const interview = await tx.interview.findUnique({
    where: { id: interviewId },
    select: { decision: true, status: true },
  });

  if (!interview) return false;

  return interview.status === "COMPLETED" && interview.decision === "SELECTED";
};

/**
 * Aggregates all feedback scores for a specific interview (and its child rounds if any).
 * Returns calculated averages and counts using pure database aggregations.
 */
export const getFeedbackSummary = async (interviewId, tx = prisma) => {
  // First, find all round IDs that belong to this interview process.
  // This includes the parent interview itself and any child rounds.
  const rounds = await tx.interview.findMany({
    where: {
      OR: [
        { id: interviewId },
        { parentInterviewId: interviewId }
      ]
    },
    select: { id: true },
  });

  const roundIds = rounds.map(r => r.id);

  if (roundIds.length === 0) {
    return null;
  }

  // Aggregate the scores
  const aggregations = await tx.interviewFeedback.aggregate({
    where: {
      interviewId: { in: roundIds }
    },
    _avg: {
      overallRating: true,
      technicalScore: true,
      communicationScore: true,
      problemSolvingScore: true,
      cultureFitScore: true,
    },
    _count: {
      id: true,
    }
  });

  // Compile recommendation summary
  const recommendations = await tx.interviewFeedback.groupBy({
    by: ['recommendation'],
    where: {
      interviewId: { in: roundIds }
    },
    _count: {
      recommendation: true,
    }
  });

  // Map recommendation counts to a flat object
  const recommendationSummary = recommendations.reduce((acc, curr) => {
    acc[curr.recommendation] = curr._count.recommendation;
    return acc;
  }, {});

  // Determine the most common recommendation
  let dominantRecommendation = null;
  let maxCount = 0;
  for (const [rec, count] of Object.entries(recommendationSummary)) {
    if (count > maxCount) {
      maxCount = count;
      dominantRecommendation = rec;
    }
  }

  return {
    overallAverageRating: aggregations._avg.overallRating ? Number(aggregations._avg.overallRating.toFixed(2)) : 0,
    technicalAverage: aggregations._avg.technicalScore ? Number(aggregations._avg.technicalScore.toFixed(2)) : 0,
    communicationAverage: aggregations._avg.communicationScore ? Number(aggregations._avg.communicationScore.toFixed(2)) : 0,
    problemSolvingAverage: aggregations._avg.problemSolvingScore ? Number(aggregations._avg.problemSolvingScore.toFixed(2)) : 0,
    cultureFitAverage: aggregations._avg.cultureFitScore ? Number(aggregations._avg.cultureFitScore.toFixed(2)) : 0,
    numberOfInterviewers: aggregations._count.id,
    recommendationSummary: dominantRecommendation || "PENDING",
    recommendationCounts: recommendationSummary
  };
};

/**
 * Retrieves timeline events directly from the Interview model.
 */
export const getInterviewRoundsRaw = async (interviewId, tx = prisma) => {
  return tx.interview.findMany({
    where: {
      OR: [
        { id: interviewId },
        { parentInterviewId: interviewId }
      ]
    },
    select: {
      id: true,
      title: true,
      roundNumber: true,
      status: true,
      createdAt: true,
      completedAt: true,
      decision: true,
      decisionNotes: true,
      scheduledBy: { select: { id: true, name: true } },
      history: {
        select: {
          id: true,
          action: true,
          reason: true,
          createdAt: true,
          performedBy: { select: { id: true, name: true } }
        }
      },
      feedbacks: {
        select: {
          id: true,
          recommendation: true,
          createdAt: true,
          interviewer: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};
