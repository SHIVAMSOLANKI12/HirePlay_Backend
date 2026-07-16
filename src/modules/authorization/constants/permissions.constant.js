export const PERMISSIONS = {
  JOB_CREATE: "job.create",
  JOB_READ: "job.read",
  JOB_UPDATE: "job.update",
  JOB_DELETE: "job.delete",
  
  APPLICATION_READ: "application.read",
  APPLICATION_UPDATE: "application.update",
  
  INTERVIEW_SCHEDULE: "interview.schedule",
  INTERVIEW_FEEDBACK: "interview.feedback",
  
  OFFER_CREATE: "offer.create",
  OFFER_APPROVE: "offer.approve",
  OFFER_SEND: "offer.send",
  OFFER_REVOKE: "offer.revoke",
  
  CANDIDATE_READ: "candidate.read",
  CANDIDATE_UPDATE: "candidate.update",
  
  COMPANY_MANAGE: "company.manage",
  HR_MANAGE: "hr.manage",
  
  DASHBOARD_VIEW: "dashboard.view",
  ANALYTICS_VIEW: "analytics.view"
};

export const DEFAULT_PERMISSIONS = Object.values(PERMISSIONS);
