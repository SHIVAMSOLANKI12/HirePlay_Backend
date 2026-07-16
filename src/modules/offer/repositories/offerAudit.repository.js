import prisma from "../../../config/prisma.js";

export const createTimelineEvent = async (data, tx = prisma) => {
  return await tx.offerTimeline.create({
    data
  });
};

export const createAuditLog = async (data, tx = prisma) => {
  return await tx.offerAuditLog.create({
    data
  });
};

export const getTimeline = async (offerId, tx = prisma) => {
  return await tx.offerTimeline.findMany({
    where: { offerId },
    orderBy: { createdAt: "desc" },
    include: {
      performedBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

export const getAuditLogs = async (offerId, tx = prisma) => {
  return await tx.offerAuditLog.findMany({
    where: { offerId },
    orderBy: { createdAt: "desc" },
    include: {
      performedBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};
