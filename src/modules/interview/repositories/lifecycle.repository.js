import prisma from "../../../config/prisma.js";

/**
 * Updates an interview's status and schedule, returning the updated record.
 */
export const updateInterviewState = async (id, data, tx = prisma) => {
  return tx.interview.update({
    where: { id },
    data,
    include: { job: true },
  });
};

/**
 * Creates an Interview History audit log.
 */
export const createInterviewHistory = async (data, tx = prisma) => {
  return tx.interviewHistory.create({
    data,
    select: {
      id: true,
      interviewId: true,
      action: true,
      oldScheduledAt: true,
      newScheduledAt: true,
      oldStatus: true,
      newStatus: true,
      reason: true,
      performedById: true,
      metadata: true,
      createdAt: true,
      performedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Retrieves the history audit log for a given interview.
 */
export const findInterviewHistory = async (interviewId, tx = prisma) => {
  return tx.interviewHistory.findMany({
    where: { interviewId },
    select: {
      id: true,
      interviewId: true,
      action: true,
      oldScheduledAt: true,
      newScheduledAt: true,
      oldStatus: true,
      newStatus: true,
      reason: true,
      performedById: true,
      metadata: true,
      createdAt: true,
      performedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
