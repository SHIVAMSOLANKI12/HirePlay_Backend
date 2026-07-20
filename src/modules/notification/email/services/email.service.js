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

    // 2. We need the recipient email. We can fetch it via the user relation if not in payload
    let recipientEmail = notification.payload?.recipientEmail;
    
    if (!recipientEmail) {
      const user = await prisma.user.findUnique({ where: { id: notification.userId } });
      recipientEmail = user?.email;
    }

    if (!recipientEmail) {
      throw new Error("Recipient email is missing");
    }

    // 3. Render Template
    // Determine the specific body content for this event type
    // The subscriber passes `eventName` inside metadata if we need it, but let's assume payload.eventName is passed, 
    // or we can fallback to the generic template
    const eventName = notification.payload?.eventName || "DEFAULT";
    const bodyTemplateRaw = EMAIL_TEMPLATES[eventName] || EMAIL_TEMPLATES["DEFAULT"];
    
    // We inject the message/payload into the BodyContent of the base layout
    const templateVars = {
      ...notification.payload,
      NotificationTitle: notification.title,
      NotificationMessage: notification.message,
      CompanyName: notification.payload?.companyName || "HirePlay",
      Year: new Date().getFullYear(),
    };

    // First render the inner body
    const renderedBody = renderTemplate(bodyTemplateRaw, templateVars);
    
    // Then inject the rendered body into the base layout
    templateVars.BodyContent = renderedBody;
    const htmlBody = renderTemplate(BASE_HTML_LAYOUT, templateVars);

    // 4. Send Email via Provider
    const result = await emailProvider.sendEmail({
      to: recipientEmail,
      subject: notification.title,
      html: htmlBody
    });

    // 5. Update Status
    if (result.success) {
      await markEmailAsSent(notification.id, result.messageId, PROVIDER_NAME);
      console.log(`[EmailService] Email sent successfully for notification ${notification.id}`);
    } else {
      await markEmailAsFailed(notification.id, result.error, PROVIDER_NAME);
      console.error(`[EmailService] Email failed for notification ${notification.id}`);
    }
    
  } catch (error) {
    console.error(`[EmailService] Critical error processing email ${notification.id}: ${error.message}`);
    await markEmailAsFailed(notification.id, error.message, PROVIDER_NAME);
  }
};
