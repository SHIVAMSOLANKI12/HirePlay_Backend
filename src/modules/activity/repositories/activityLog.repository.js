import prisma from "../../../config/prisma.js";

export const createActivityLog = async (data) => {
  return prisma.activityLog.create({
    data
  });
};

export const getActivityLogById = async (companyId, activityId) => {
  return prisma.activityLog.findFirst({
    where: {
      id: activityId,
      companyId,
      deletedAt: null
    }
  });
};

export const getActivityLogs = async (companyId, filters = {}) => {
  const { userId, entityType, entityId, action, startDate, endDate, page = 1, limit = 10, sort = "desc" } = filters;
  
  const skip = (page - 1) * limit;
  
  const where = {
    companyId,
    deletedAt: null,
    ...(userId && { userId }),
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(action && { action })
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const orderBy = { createdAt: sort === "asc" ? "asc" : "desc" };

  const [total, data] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy,
      skip: Number(skip),
      take: Number(limit)
    })
  ]);

  return { total, data, page: Number(page), limit: Number(limit) };
};
