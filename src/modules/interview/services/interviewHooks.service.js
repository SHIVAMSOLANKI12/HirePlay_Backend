import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { createActivityLog } from "../../activity/services/activityLog.service.js";

/**
 * Hook triggered when an interview is rescheduled.
 */
export const onInterviewRescheduled = async (interview, history, user, tx) => {
  // Activity Feed (Application Level)
  await logApplicationActivity({
    applicationId: interview.applicationId,
    performedBy: user.id,
    action: "INTERVIEW_RESCHEDULED",
    metadata: {
      interviewId: interview.id,
      historyId: history.id,
      oldScheduledAt: history.oldScheduledAt,
      newScheduledAt: history.newScheduledAt,
      reason: history.reason,
    },
  }, tx);

  // Activity Log (Dashboard/Timeline)
  await createActivityLog({
    userId: interview.candidateId,
    companyId: interview.companyId,
    applicationId: interview.applicationId,
    jobId: interview.jobId,
    type: "INTERVIEW_RESCHEDULED",
    title: `Interview Rescheduled`,
    description: `Interview "${interview.title}" has been rescheduled to ${new Date(history.newScheduledAt).toLocaleString()}. Reason: ${history.reason}`,
    metadata: { interviewId: interview.id, historyId: history.id },
  }, tx);
  
  // Future: Trigger Notification Module / Email here
};

/**
 * Hook triggered when an interview is cancelled.
 */
export const onInterviewCancelled = async (interview, history, user, tx) => {
  // Activity Feed (Application Level)
  await logApplicationActivity({
    applicationId: interview.applicationId,
    performedBy: user.id,
    action: "INTERVIEW_CANCELLED",
    metadata: {
      interviewId: interview.id,
      historyId: history.id,
      reason: history.reason,
    },
  }, tx);

  // Activity Log (Dashboard/Timeline)
  await createActivityLog({
    userId: interview.candidateId,
    companyId: interview.companyId,
    applicationId: interview.applicationId,
    jobId: interview.jobId,
    type: "INTERVIEW_CANCELLED",
    title: `Interview Cancelled`,
    description: `Interview "${interview.title}" has been cancelled. Reason: ${history.reason}`,
    metadata: { interviewId: interview.id, historyId: history.id },
  }, tx);

  // Future: Trigger Notification Module / Email here
};
