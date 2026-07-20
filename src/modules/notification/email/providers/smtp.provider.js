import nodemailer from "nodemailer";
import EmailProvider from "./email.provider.interface.js";
// import logger from "../../../../config/logger.js";

export default class SMTPProvider extends EmailProvider {
  constructor() {
    super();
    // For production, these should come from environment variables.
    // For now, we use Ethereal Mail (or log to console) if vars are missing.
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * @param {Object} options 
   * @param {string} options.to 
   * @param {string} options.subject 
   * @param {string} options.html 
   */
  async sendEmail(options) {
    try {
      // If we don't have real credentials, just log it (useful for local dev)
      if (!process.env.SMTP_USER) {
        console.log(`[SMTPProvider Mock] Sending email to: ${options.to}`);
        console.log(`[SMTPProvider Mock] Subject: ${options.subject}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          messageId: `mock-id-${Date.now()}`
        };
      }

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"HirePlay ATS" <no-reply@hireplay.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error(`[SMTPProvider] Error sending email: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}


