import { getInterviewRoundsRaw } from "../repositories/decision.repository.js";

/**
 * Builds a chronological timeline of an interview journey by aggregating
 * all rounds, their histories, and feedbacks.
 */
export const buildInterviewTimeline = async (interviewId) => {
  const rounds = await getInterviewRoundsRaw(interviewId);
  const events = [];

  for (const round of rounds) {
    // 1. Round Scheduled/Created Event
    events.push({
      id: `scheduled-${round.id}`,
      type: "INTERVIEW_SCHEDULED",
      title: `Round ${round.roundNumber} Scheduled: ${round.title}`,
      description: `Interview round scheduled successfully.`,
      performedBy: round.scheduledBy,
      createdAt: round.createdAt,
    });

    // 2. Round Completed Event
    if (round.status === "COMPLETED" && round.completedAt) {
      events.push({
        id: `completed-${round.id}`,
        type: "INTERVIEW_COMPLETED",
        title: `Round ${round.roundNumber} Completed: ${round.title}`,
        description: `Interview round was marked as completed.`,
        performedBy: null, // Usually system or inferred, omitted for simplicity
        createdAt: round.completedAt,
      });
    }

    // 3. Round Decision Updated Event
    if (round.decision !== "PENDING") {
      events.push({
        id: `decision-${round.id}`,
        type: "INTERVIEW_DECISION_UPDATED",
        title: `Decision: ${round.decision}`,
        description: round.decisionNotes || `Decision updated for round ${round.roundNumber}.`,
        performedBy: null, // We don't explicitly track the user who made the decision on the model yet, unless we parse history
        createdAt: round.updatedAt || round.createdAt, // Approximation since we didn't add decisionUpdatedAt
      });
    }

    // 4. History Events (Rescheduled, Cancelled)
    for (const history of round.history) {
      events.push({
        id: `history-${history.id}`,
        type: `INTERVIEW_${history.action}`, // INTERVIEW_RESCHEDULED or INTERVIEW_CANCELLED
        title: `Round ${round.roundNumber} ${history.action}`,
        description: `Reason: ${history.reason}`,
        performedBy: history.performedBy,
        createdAt: history.createdAt,
      });
    }

    // 5. Feedback Events
    for (const feedback of round.feedbacks) {
      events.push({
        id: `feedback-${feedback.id}`,
        type: "INTERVIEW_FEEDBACK_SUBMITTED",
        title: `Feedback Submitted`,
        description: `Recommendation: ${feedback.recommendation}`,
        performedBy: feedback.interviewer,
        createdAt: feedback.createdAt,
      });
    }
  }

  // Sort chronologically ascending
  events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return events;
};
