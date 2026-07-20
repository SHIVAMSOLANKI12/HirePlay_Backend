import prisma from "../../../config/prisma.js";

export const createActivityLog = async (data) => {
  return prisma.activityLog.create({
    data
  });
};

const DEFAULT_SELECT = {
  id: true,
  entityType: true,
  entityId: true,
  action: true,
  oldValue: true,
  newValue: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
  performedByRole: true,
  userId: true,
  createdAt: true,
};

export const getActivityLogById = async (companyId, activityId) => {
  return prisma.activityLog.findFirst({
    where: {
      id: activityId,
      companyId,
      deletedAt: null,
      archivedAt: null
    },
    select: DEFAULT_SELECT
  });
};

const buildSearchWhere = (companyId, filters) => {
  const { q, entityType, entityId, action, userId, performedByRole, startDate, endDate } = filters;

  const where = {
    companyId,
    deletedAt: null,
    archivedAt: null, // Universally filter out archived logs from active queries
    ...(userId && { userId }),
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(action && { action }),
    ...(performedByRole && { performedByRole })
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (q && q.trim() !== "") {
    const searchString = q.trim();
    where.OR = [
      { entityType: { contains: searchString, mode: 'insensitive' } },
      { action: { contains: searchString, mode: 'insensitive' } },
      { entityId: { contains: searchString, mode: 'insensitive' } },
      { userId: { contains: searchString, mode: 'insensitive' } },
      { performedByRole: { contains: searchString, mode: 'insensitive' } }
    ];
  }

  return where;
};

export const getActivityLogs = async (companyId, filters = {}) => {
  const { page = 1, limit = 10, sort = "desc" } = filters;
  
  const skip = (page - 1) * limit;
  const where = buildSearchWhere(companyId, filters);
  const orderBy = { createdAt: sort === "asc" ? "asc" : "desc" };

  const [total, data] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy,
      skip: Number(skip),
      take: Number(limit),
      select: DEFAULT_SELECT
    })
  ]);

  return { total, data, page: Number(page), limit: Number(limit) };
};

export const searchActivityLogs = async (companyId, filters = {}) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = filters;
  
  const skip = (page - 1) * limit;
  const where = buildSearchWhere(companyId, filters);

  const orderBy = { [sortBy]: sortOrder === "asc" ? "asc" : "desc" };

  const [total, data] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy,
      skip: Number(skip),
      take: Number(limit),
      select: DEFAULT_SELECT
    })
  ]);

  return { total, data, page: Number(page), limit: Number(limit) };
};

export const getExportActivityLogs = async (companyId, filters = {}) => {
  const { sortBy = "createdAt", sortOrder = "desc" } = filters;
  
  const where = buildSearchWhere(companyId, filters);
  const orderBy = { [sortBy]: sortOrder === "asc" ? "asc" : "desc" };

  // For export, we might fetch all matching records.
  // In a very large dataset, this should be paginated/streamed, but Prisma findMany is fine for typical sizes.
  return prisma.activityLog.findMany({
    where,
    orderBy,
    select: DEFAULT_SELECT
  });
};
