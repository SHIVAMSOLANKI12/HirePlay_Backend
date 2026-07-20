import prisma from "../../../config/prisma.js";

export const createNotification = async (notificationData) => {
  return prisma.notification.create({
    data: notificationData
  });
};

export const findNotifications = async (companyId, userId, filters = {}) => {
  const { isRead, type, channel, status, startDate, endDate, sort = "desc", page = 1, limit = 10 } = filters;
  
  const skip = (page - 1) * limit;

  const where = {
    companyId,
    userId,
    deletedAt: null,
    ...(isRead !== undefined && { isRead: isRead === 'true' || isRead === true }),
    ...(type && { type }),
    ...(channel && { channel }),
    ...(status && { status })
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const orderBy = { createdAt: sort === "asc" ? "asc" : "desc" };

  const [total, data] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy,
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
      userId,
      deletedAt: null
    }
  });
};

export const getUnreadNotifications = async (companyId, userId, filters = {}) => {
  return findNotifications(companyId, userId, { ...filters, isRead: false });
};

export const getNotificationCount = async (companyId, userId) => {
  const [total, unread] = await Promise.all([
    prisma.notification.count({ where: { companyId, userId, deletedAt: null } }),
    prisma.notification.count({ where: { companyId, userId, deletedAt: null, isRead: false } })
  ]);
  return { total, unread };
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

export const markAllAsRead = async (companyId, userId) => {
  return prisma.notification.updateMany({
    where: {
      companyId,
      userId,
      isRead: false,
      deletedAt: null
    },
    data: {
      isRead: true
    }
  });
};

export const softDeleteNotification = async (companyId, userId, notificationId) => {
  return prisma.notification.update({
    where: {
      id: notificationId,
      companyId,
      userId
    },
    data: {
      deletedAt: new Date()
    }
  });
};
