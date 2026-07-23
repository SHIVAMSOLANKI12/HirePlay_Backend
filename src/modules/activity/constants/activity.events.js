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
  RESUME_PARSE_FAILED: "resume.parse_failed",
  RESUME_SCORED: "resume.scored",
  RESUME_RESCORED: "resume.rescored",
  RESUME_SEARCHED: "resume.searched",

  // Assessments
  ASSESSMENT_CREATED: "assessment.created",
  ASSESSMENT_UPDATED: "assessment.updated",
  ASSESSMENT_ASSIGNED: "assessment.assigned",
  ASSESSMENT_DELETED: "assessment.deleted",

  // Puzzles
  PUZZLE_GENERATED: "puzzle.generated",
  PUZZLE_ASSIGNED: "puzzle.assigned",

  // Game Session
  SESSION_STARTED: "session.started",
  SESSION_PAUSED: "session.paused",
  SESSION_RESUMED: "session.resumed",
  SESSION_SUBMITTED: "session.submitted",
  SESSION_EXPIRED: "session.expired",
  SESSION_CANCELLED: "session.cancelled",
  
  // Anti-Cheat
  CHEAT_DETECTED: "cheat.detected",

  // Hiring Decision
  HIRING_DECISION_CREATED: "hiring_decision.created",
  HIRING_DECISION_SUBMITTED: "hiring_decision.submitted",
  HIRING_DECISION_APPROVED: "hiring_decision.approved",
  HIRING_DECISION_REJECTED: "hiring_decision.rejected",
  HIRING_DECISION_ESCALATED: "hiring_decision.escalated",
  HIRING_DECISION_OFFER_READY: "hiring_decision.offer_ready",
  HIRING_DECISION_REOPENED: "hiring_decision.reopened",

  // Onboarding & Employee Profile
  ONBOARDING_CREATED: "onboarding.created",
  ONBOARDING_STARTED: "onboarding.started",
  ONBOARDING_UPDATED: "onboarding.updated",
  ONBOARDING_COMPLETED: "onboarding.completed",
  EMPLOYEE_PROFILE_CREATED: "employee_profile.created",
  EMPLOYEE_JOINED: "employee.joined"
};
