import prisma from "../../../config/prisma.js";

/**
 * Creates a new Application Activity record
 */
export const createActivity = async (data, tx = prisma) => {
  return tx.applicationActivity.create({
    data,
  });
};

/**
 * Fetches paginated activity records for an application
 */
export const findActivities = async ({ where, skip, take, orderBy }) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.applicationActivity.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        action: true,
        oldStatus: true,
        newStatus: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.applicationActivity.count({ where }),
  ]);

  return { items, totalCount };
};

/**
 * Fetches the most recent activity for a given application
 */
export const findLatestActivity = async (applicationId) => {
  return prisma.applicationActivity.findFirst({
    where: {
      applicationId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      action: true,
      oldStatus: true,
      newStatus: true,
      metadata: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};
