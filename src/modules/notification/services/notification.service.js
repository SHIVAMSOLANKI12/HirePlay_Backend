import prisma from "../../../config/prisma.js";
import { createNotification, findNotifications, findNotificationById, markAsRead } from "../repositories/notification.repository.js";
import { publishNotificationEvent } from "../publishers/notification.publisher.js";
import { eventEngine } from "../events/event.engine.js";
import { NOTIFICATION_EVENTS } from "../constants/notification.events.js";

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

    eventEngine.emit(NOTIFICATION_EVENTS.NOTIFICATION_CREATED, notification);

    return notification;
  } catch (error) {
    console.error("Failed to process notification event:", error);
  }
};

export const getNotificationsForUser = async (companyId, userId, filters) => {
  return findNotifications(companyId, userId, filters);
};

export const getUnreadNotificationsForUser = async (companyId, userId, filters) => {
  const { getUnreadNotifications } = await import("../repositories/notification.repository.js");
  return getUnreadNotifications(companyId, userId, filters);
};

export const getNotificationCountForUser = async (companyId, userId) => {
  const { getNotificationCount } = await import("../repositories/notification.repository.js");
  return getNotificationCount(companyId, userId);
};

export const getNotificationDetail = async (companyId, userId, notificationId) => {
  return findNotificationById(companyId, userId, notificationId);
};

export const markNotificationAsRead = async (companyId, userId, notificationId) => {
  const result = await markAsRead(companyId, userId, notificationId);
  eventEngine.emit(NOTIFICATION_EVENTS.NOTIFICATION_READ, { userId, notificationId });
  return result;
};

export const markAllNotificationsAsRead = async (companyId, userId) => {
  const { markAllAsRead } = await import("../repositories/notification.repository.js");
  const result = await markAllAsRead(companyId, userId);
  eventEngine.emit(NOTIFICATION_EVENTS.ALL_NOTIFICATIONS_READ, { userId });
  return result;
};

export const deleteNotificationForUser = async (companyId, userId, notificationId) => {
  const { softDeleteNotification } = await import("../repositories/notification.repository.js");
  const result = await softDeleteNotification(companyId, userId, notificationId);
  eventEngine.emit(NOTIFICATION_EVENTS.NOTIFICATION_DELETED, { userId, notificationId });
  return result;
};
