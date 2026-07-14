/**
 * Formats InterviewHistory object for API responses.
 * Safely strips internal metadata and formats relations.
 */
export const toHistoryDTO = (history) => {
  if (!history) return null;

  return {
    id: history.id,
    interviewId: history.interviewId,
    action: history.action,
    oldScheduledAt: history.oldScheduledAt,
    newScheduledAt: history.newScheduledAt,
    oldStatus: history.oldStatus,
    newStatus: history.newStatus,
    reason: history.reason,
    metadata: history.metadata,
    createdAt: history.createdAt,
    
    performedBy: history.performedBy ? {
      id: history.performedBy.id,
      name: history.performedBy.name,
      email: history.performedBy.email,
    } : undefined,
  };
};
