import prisma from "../../../config/prisma.js";

export const createNotification = async (notificationData) => {
  return prisma.notification.create({
    data: notificationData
  });
};

export const findNotifications = async (companyId, userId, filters = {}) => {
  const { isRead, type, page = 1, limit = 10 } = filters;
  
  const skip = (page - 1) * limit;

  const where = {
    companyId,
    userId,
    ...(isRead !== undefined && { isRead: isRead === 'true' }),
    ...(type && { type })
  };

  const [total, data] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(limit)
    })
  ]);

  return { total, data, page: Number(page), limit: Number(limit) };
};

export const findNotificationById = async (companyId, userId, notificationId) => {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      companyId,
      userId
    }
  });
};

export const markAsRead = async (companyId, userId, notificationId) => {
  return prisma.notification.update({
    where: {
      id: notificationId,
      companyId,
      userId
    },
    data: {
      isRead: true
    }
  });
};
