/**
 * Abstract class / Interface for Email Providers
 * All email providers (SMTP, AWS SES, SendGrid, etc.) must implement this interface.
 */
export default class EmailProvider {
  /**
   * Sends an email.
   * @param {Object} options 
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendEmail(options) {
    throw new Error("Method 'sendEmail(options)' must be implemented.");
  }
}
