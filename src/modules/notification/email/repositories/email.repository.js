import prisma from "../../../../config/prisma.js";

/**
 * Updates a notification after a successful email delivery
 * @param {string} notificationId 
 * @param {string} messageId 
 * @param {string} providerName 
 */
export const markEmailAsSent = async (notificationId, messageId, providerName) => {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "SENT",
      messageId,
      provider: providerName,
      sentAt: new Date(),
    }
  });
};

/**
 * Updates a notification after a failed email delivery
 * @param {string} notificationId 
 * @param {string} failureReason 
 * @param {string} providerName 
 */
export const markEmailAsFailed = async (notificationId, failureReason, providerName) => {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "FAILED",
      failureReason: failureReason?.substring(0, 255), // avoid overly long strings
      provider: providerName,
      failedAt: new Date(),
      retryCount: {
        increment: 1
      }
    }
  });
};

/**
 * Marks notification as currently processing
 * @param {string} notificationId 
 */
export const markEmailAsProcessing = async (notificationId) => {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "PROCESSING",
      processingAt: new Date()
    }
  });
};
