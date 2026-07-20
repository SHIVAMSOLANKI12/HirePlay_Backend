import { NotificationDTO } from "../dto/notification.dto.js";

export const toNotificationDTO = (notification) => {
  if (!notification) return null;
  return new NotificationDTO(notification);
};

export const toNotificationListDTO = (notifications, total, page, limit) => {
  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: notifications.map(n => toNotificationDTO(n))
  };
};

export const toNotificationCountDTO = (countData) => {
  return {
    total: countData.total,
    unread: countData.unread
  };
};
