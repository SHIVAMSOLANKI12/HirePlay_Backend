/**
 * Standardizes timeline events to prevent leaking metadata.
 */
export const toTimelineDTO = (events) => {
  if (!events || !Array.isArray(events)) return [];

  return events.map(event => ({
    id: event.id,
    type: event.type,
    title: event.title,
    description: event.description,
    performedBy: event.performedBy ? {
      id: event.performedBy.id,
      name: event.performedBy.name,
    } : null,
    createdAt: event.createdAt,
  }));
};

/**
 * Standardizes decision payloads.
 */
export const toDecisionDTO = (decisionData) => {
  if (!decisionData) return null;

  return {
    decision: decisionData.decision,
    eligibleForOffer: decisionData.eligibleForOffer,
    feedbackSummary: {
      overallAverageRating: decisionData.feedbackSummary.overallAverageRating,
      technicalAverage: decisionData.feedbackSummary.technicalAverage,
      communicationAverage: decisionData.feedbackSummary.communicationAverage,
      problemSolvingAverage: decisionData.feedbackSummary.problemSolvingAverage,
      cultureFitAverage: decisionData.feedbackSummary.cultureFitAverage,
      recommendationSummary: decisionData.feedbackSummary.recommendationSummary,
    }
  };
};
