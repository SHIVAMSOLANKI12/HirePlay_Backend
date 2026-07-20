import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";

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

  eventEngine.emit(ACTIVITY_EVENTS.INTERVIEW_RESCHEDULED, {
    userId: interview.candidateId,
    companyId: interview.companyId,
    entityId: interview.id,
    performedByRole: user.role,
    oldValue: { scheduledAt: history.oldScheduledAt },
    newValue: { scheduledAt: history.newScheduledAt, title: "Interview Rescheduled", description: `Interview "${interview.title}" has been rescheduled to ${new Date(history.newScheduledAt).toLocaleString()}. Reason: ${history.reason}` },
    metadata: { historyId: history.id }
  });
  
  // Trigger Notification Module
  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");
  
  publishNotificationEvent(NOTIFICATION_EVENTS.INTERVIEW_RESCHEDULED, {
    companyId: interview.companyId,
    userId: interview.candidateId,
    type: "INTERVIEW",
    channel: "EMAIL",
    title: "Interview Rescheduled",
    message: `Your interview "${interview.title}" has been rescheduled.`,
    metadata: { interviewId: interview.id },
    eventName: NOTIFICATION_EVENTS.INTERVIEW_RESCHEDULED,
    CandidateName: "Candidate", // We might not have the full candidate object here, it can be fetched by email service if needed, or we just pass defaults
    InterviewDate: new Date(history.newScheduledAt).toLocaleDateString(),
    InterviewTime: new Date(history.newScheduledAt).toLocaleTimeString(),
    RecruiterName: user.firstName || "Recruiter",
  });
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

  eventEngine.emit(ACTIVITY_EVENTS.INTERVIEW_CANCELLED, {
    userId: interview.candidateId,
    companyId: interview.companyId,
    entityId: interview.id,
    performedByRole: user.role,
    newValue: { title: "Interview Cancelled", description: `Interview "${interview.title}" has been cancelled. Reason: ${history.reason}` },
    metadata: { historyId: history.id }
  });

  // Trigger Notification Module
  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");
  
  publishNotificationEvent(NOTIFICATION_EVENTS.INTERVIEW_CANCELLED, {
    companyId: interview.companyId,
    userId: interview.candidateId,
    type: "INTERVIEW",
    channel: "EMAIL",
    title: "Interview Cancelled",
    message: `Your interview "${interview.title}" has been cancelled.`,
    metadata: { interviewId: interview.id },
    eventName: NOTIFICATION_EVENTS.INTERVIEW_CANCELLED,
    CandidateName: "Candidate",
    RecruiterName: user.firstName || "Recruiter",
  });
};
