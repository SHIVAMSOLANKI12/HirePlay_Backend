import { NOTIFICATION_EVENTS } from "../../../constants/notification.events.js";

// Mapping events to specific body content templates
export const EMAIL_TEMPLATES = {
  [NOTIFICATION_EVENTS.AUTH_PASSWORD_RESET]: `
    <h2>Password Reset Request</h2>
    <p>Hi {{UserName}},</p>
    <p>You recently requested to reset your password for your {{CompanyName}} account. Click the button below to proceed.</p>
    <a href="{{PasswordResetLink}}" class="button">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 30 minutes.</p>
  `,
  
  [NOTIFICATION_EVENTS.HR_CREATED]: `
    <h2>Welcome to {{CompanyName}} ATS!</h2>
    <p>Hi {{UserName}},</p>
    <p>Your HR account has been successfully created. You can now log in and manage jobs, candidates, and interviews.</p>
    <a href="{{LoginLink}}" class="button">Log In Now</a>
  `,

  [NOTIFICATION_EVENTS.INTERVIEW_SCHEDULED]: `
    <h2>Interview Scheduled</h2>
    <p>Hi {{CandidateName}},</p>
    <p>Good news! Your interview for the <strong>{{JobTitle}}</strong> position at {{CompanyName}} has been scheduled.</p>
    <p><strong>Date:</strong> {{InterviewDate}}<br>
       <strong>Time:</strong> {{InterviewTime}}</p>
    <p>Recruiter <strong>{{RecruiterName}}</strong> will be hosting the session.</p>
  `,

  [NOTIFICATION_EVENTS.INTERVIEW_RESCHEDULED]: `
    <h2>Interview Rescheduled</h2>
    <p>Hi {{CandidateName}},</p>
    <p>Your interview for the <strong>{{JobTitle}}</strong> position at {{CompanyName}} has been rescheduled.</p>
    <p><strong>New Date:</strong> {{InterviewDate}}<br>
       <strong>New Time:</strong> {{InterviewTime}}</p>
    <p>If you have any questions, please reach out to {{RecruiterName}}.</p>
  `,

  [NOTIFICATION_EVENTS.INTERVIEW_CANCELLED]: `
    <h2>Interview Cancelled</h2>
    <p>Hi {{CandidateName}},</p>
    <p>Your interview for the <strong>{{JobTitle}}</strong> position at {{CompanyName}} has been cancelled.</p>
    <p>We apologize for any inconvenience. Your recruiter, {{RecruiterName}}, will be in touch with further updates.</p>
  `,

  [NOTIFICATION_EVENTS.OFFER_CREATED]: `
    <h2>New Offer Created (Internal)</h2>
    <p>An offer has been drafted for <strong>{{CandidateName}}</strong> for the position of {{JobTitle}}.</p>
    <p><strong>Salary:</strong> {{OfferSalary}}<br>
       <strong>Expected Joining:</strong> {{OfferJoiningDate}}</p>
    <p>Please review and approve.</p>
  `,

  [NOTIFICATION_EVENTS.OFFER_APPROVED]: `
    <h2>Offer Approved (Internal)</h2>
    <p>The offer for <strong>{{CandidateName}}</strong> ({{JobTitle}}) has been approved.</p>
    <p>It is now ready to be sent to the candidate.</p>
  `,

  [NOTIFICATION_EVENTS.OFFER_SENT]: `
    <h2>Job Offer from {{CompanyName}}!</h2>
    <p>Hi {{CandidateName}},</p>
    <p>We are thrilled to offer you the position of <strong>{{JobTitle}}</strong> at {{CompanyName}}!</p>
    <p><strong>Offered Salary:</strong> {{OfferSalary}}<br>
       <strong>Expected Joining Date:</strong> {{OfferJoiningDate}}</p>
    <p>Please review the offer details. We look forward to welcoming you to the team.</p>
    <a href="{{OfferLink}}" class="button">Review Offer</a>
  `,

  [NOTIFICATION_EVENTS.OFFER_ACCEPTED]: `
    <h2>Offer Accepted! (Internal)</h2>
    <p>Great news! <strong>{{CandidateName}}</strong> has accepted the offer for the {{JobTitle}} position.</p>
    <p>They are expected to join on {{OfferJoiningDate}}.</p>
  `,

  [NOTIFICATION_EVENTS.OFFER_REJECTED]: `
    <h2>Offer Declined (Internal)</h2>
    <p>Unfortunately, <strong>{{CandidateName}}</strong> has declined the offer for the {{JobTitle}} position.</p>
  `,

  [NOTIFICATION_EVENTS.APPLICATION_SUBMITTED]: `
    <h2>Application Received</h2>
    <p>Hi {{CandidateName}},</p>
    <p>Thank you for applying for the <strong>{{JobTitle}}</strong> role at {{CompanyName}}. We have successfully received your application.</p>
    <p>Our recruitment team will review your profile and get back to you soon.</p>
  `,

  [NOTIFICATION_EVENTS.JOB_PUBLISHED]: `
    <h2>New Job Published (Internal)</h2>
    <p>The job <strong>{{JobTitle}}</strong> has been successfully published to the portal.</p>
  `,

  [NOTIFICATION_EVENTS.JOB_CLOSED]: `
    <h2>Job Closed (Internal)</h2>
    <p>The job <strong>{{JobTitle}}</strong> has been closed and is no longer accepting new applications.</p>
  `,

  // Fallback for general notifications
  "DEFAULT": `
    <h2>{{NotificationTitle}}</h2>
    <p>{{NotificationMessage}}</p>
  `
};
