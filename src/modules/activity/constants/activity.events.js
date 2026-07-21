export const ACTIVITY_EVENTS = {
  // Authentication
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",
  AUTH_PASSWORD_RESET: "auth.password_reset",

  // HR
  HR_CREATED: "hr.created",
  HR_UPDATED: "hr.updated",
  HR_DELETED: "hr.deleted",

  // Jobs
  JOB_CREATED: "job.created",
  JOB_UPDATED: "job.updated",
  JOB_PUBLISHED: "job.published",
  JOB_CLOSED: "job.closed",
  JOB_DELETED: "job.deleted",

  // Applications
  APPLICATION_APPLIED: "application.applied",
  APPLICATION_WITHDRAWN: "application.withdrawn",
  APPLICATION_STATUS_CHANGED: "application.status_changed",

  // Interviews
  INTERVIEW_SCHEDULED: "interview.scheduled",
  INTERVIEW_RESCHEDULED: "interview.rescheduled",
  INTERVIEW_CANCELLED: "interview.cancelled",
  INTERVIEW_FEEDBACK_SUBMITTED: "interview.feedback_submitted",

  // Offers
  OFFER_CREATED: "offer.created",
  OFFER_APPROVED: "offer.approved",
  OFFER_SENT: "offer.sent",
  OFFER_ACCEPTED: "offer.accepted",
  OFFER_REJECTED: "offer.rejected",

  // Notifications
  NOTIFICATION_EMAIL_SENT: "notification.email_sent",
  NOTIFICATION_EMAIL_FAILED: "notification.email_failed",

  // Resumes
  RESUME_PREVIEWED: "resume.previewed",
  RESUME_DOWNLOADED: "resume.downloaded",
  RESUME_PARSED: "resume.parsed",
  RESUME_REPARSED: "resume.reparsed",
  RESUME_PARSE_FAILED: "resume.parse_failed"
};
