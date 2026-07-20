export const NOTIFICATION_EVENTS = {
  // Authentication Events
  AUTH_PASSWORD_RESET: "auth.password.reset",

  // HR Events
  HR_CREATED: "hr.created",

  // Job Events
  JOB_PUBLISHED: "job.published",
  JOB_CLOSED: "job.closed",

  // Application Events
  APPLICATION_SUBMITTED: "application.submitted",
  APPLICATION_STATUS_CHANGED: "application.status_changed",

  // Interview Events
  INTERVIEW_SCHEDULED: "interview.scheduled",
  INTERVIEW_RESCHEDULED: "interview.rescheduled",
  INTERVIEW_CANCELLED: "interview.cancelled",
  INTERVIEW_FEEDBACK_SUBMITTED: "interview.feedback_submitted",

  // Offer Events
  OFFER_CREATED: "offer.created",
  OFFER_APPROVED: "offer.approved",
  OFFER_SENT: "offer.sent",
  OFFER_ACCEPTED: "offer.accepted",
  OFFER_REJECTED: "offer.rejected",

  // System Events
  SYSTEM_ALERT: "system.alert",

  // Real-Time / Internal Notification State Events
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_READ: "notification.read",
  ALL_NOTIFICATIONS_READ: "notification.read_all",
  NOTIFICATION_DELETED: "notification.deleted"
};
