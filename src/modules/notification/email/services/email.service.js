// import logger from "../../../../config/logger.js";
import SMTPProvider from "../providers/smtp.provider.js";
import { renderTemplate } from "../templates/template.renderer.js";
import { BASE_HTML_LAYOUT } from "../templates/html/base.layout.js";
import { EMAIL_TEMPLATES } from "../templates/html/content.templates.js";
import { markEmailAsProcessing, markEmailAsSent, markEmailAsFailed } from "../repositories/email.repository.js";
import prisma from "../../../../config/prisma.js";

// Factory/Dependency Injection pattern: we can easily swap SMTPProvider for AWSSESProvider later
const emailProvider = new SMTPProvider();
const PROVIDER_NAME = "SMTP";

/**
 * Processes an email notification
 * @param {Object} notification 
 */
export const processEmailNotification = async (notification) => {
  try {
    // 1. Mark as processing
    await markEmailAsProcessing(notification.id);

    // 2. Fetch User Preferences First
    const { getNotificationPreferencesForUser } = await import("../../services/preference.service.js");
    const prefs = await getNotificationPreferencesForUser(notification.userId, notification.companyId);
    
    if (!prefs.emailEnabled) {
      console.log(`[EmailService] Skipping email for notification ${notification.id} because emailEnabled is false.`);
      await markEmailAsFailed(notification.id, "User disabled email notifications", "SYSTEM");
      return;
    }

    // 3. We need the recipient email. We can fetch it via the user relation if not in payload
    let recipientEmail = notification.payload?.recipientEmail;
    
    if (!recipientEmail) {
      const user = await prisma.user.findUnique({ where: { id: notification.userId } });
      recipientEmail = user?.email;
    }

    if (!recipientEmail) {
      throw new Error("Recipient email is missing");
    }

    // 4. Render Handlebars Template
    const eventName = notification.payload?.eventName;
    let subject, htmlBody, textBody;
    
    try {
      if (!eventName) throw new Error("No eventName provided");

      // Fetch company for branding
      const company = await prisma.company.findUnique({ where: { id: notification.companyId } });
      
      const templateVars = {
        ...notification.payload,
        "Candidate Name": notification.payload?.candidateName || "Candidate",
        "Recruiter Name": notification.payload?.recruiterName || "Recruiter",
        "Company Name": company?.name || notification.payload?.companyName || "HirePlay",
        "Job Title": notification.payload?.jobTitle || "Job",
        "Interview Date": notification.payload?.interviewDate || "",
        "Interview Time": notification.payload?.interviewTime || "",
        "Offer Salary": notification.payload?.offerSalary || "",
        "Offer Joining Date": notification.payload?.offerJoiningDate || "",
        "Password Reset Link": notification.payload?.passwordResetLink || "",
        branding: {
          companyName: company?.name || notification.payload?.companyName || "HirePlay",
          logoUrl: company?.logo || null,
          primaryColor: "#007bff", // Default color
          supportEmail: company?.email || "support@hireplay.com"
        }
      };
      
      const rendered = renderTemplate(eventName, templateVars);
      subject = rendered.subject;
      htmlBody = rendered.html;
      textBody = rendered.text;
    } catch (e) {
      // Fallback if template doesn't exist or eventName missing
      console.warn(`[EmailService] Falling back to default rendering: ${e.message}`);
      subject = notification.title;
      htmlBody = `<p>${notification.message}</p>`;
      textBody = notification.message;
    }

    // 5. Send Email via Provider
    const result = await emailProvider.sendEmail({
      to: recipientEmail,
      subject: subject,
      html: htmlBody,
      text: textBody
    });

    // 5. Update Status
    if (result.success) {
      await markEmailAsSent(notification.id, result.messageId, PROVIDER_NAME);
      console.log(`[EmailService] Email sent successfully for notification ${notification.id}`);
    } else {
      await markEmailAsFailed(notification.id, result.error, PROVIDER_NAME);
      console.error(`[EmailService] Email failed for notification ${notification.id}`);
      throw new Error(`SMTP Error: ${result.error}`); // Throw so BullMQ can retry
    }
    
  } catch (error) {
    console.error(`[EmailService] Critical error processing email ${notification.id}: ${error.message}`);
    await markEmailAsFailed(notification.id, error.message, PROVIDER_NAME);
    throw error; // Throw so BullMQ can retry
  }
};
