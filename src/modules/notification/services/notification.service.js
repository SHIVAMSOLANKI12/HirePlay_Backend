import prisma from "../../../config/prisma.js";
import { createNotification, findNotifications, findNotificationById, markAsRead } from "../repositories/notification.repository.js";
import { publishNotificationEvent } from "../publishers/notification.publisher.js";

export const getCompanyIdForUser = async (user) => {
  if (user.companyId) return user.companyId;

  if (user.role === "COMPANY_ADMIN") {
    const company = await prisma.company.findFirst({ where: { ownerId: user.id } });
    return company?.id;
  }
  
  return null;
};

/**
 * Handles saving the notification to the database.
 * This is typically called by the subscriber.
 */
export const processNotificationEvent = async (payload) => {
  try {
    const { companyId, userId, type, channel = "IN_APP", title, message, metadata = {} } = payload;
    
    // Validate minimally
    if (!companyId || !userId || !type || !title || !message) {
      console.warn("Invalid notification payload, skipping:", payload);
      return null;
    }

    const notification = await createNotification({
      companyId,
      userId,
      type,
      channel,
      title,
      message,
      payload: metadata,
      status: "PENDING" // Default for now, later BullMQ will pick this up
    });

    return notification;
  } catch (error) {
    console.error("Failed to process notification event:", error);
  }
};

export const getNotificationsForUser = async (companyId, userId, filters) => {
  return findNotifications(companyId, userId, filters);
};

export const getNotificationDetail = async (companyId, userId, notificationId) => {
  return findNotificationById(companyId, userId, notificationId);
};

export const markNotificationAsRead = async (companyId, userId, notificationId) => {
  return markAsRead(companyId, userId, notificationId);
};
