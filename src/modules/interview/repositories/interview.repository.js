import prisma from "../../../config/prisma.js";

/**
 * Creates a new interview record within a transaction.
 */
export const createInterview = async (data, tx = prisma) => {
  return tx.interview.create({
    data,
  });
};

/**
 * Checks if a candidate already has an interview scheduled for the same application
 * overlapping with the requested time (exact time match for simplicity, can be expanded to range).
 */
export const findConflictingInterview = async (applicationId, scheduledAt, tx = prisma) => {
  return tx.interview.findFirst({
    where: {
      applicationId,
      scheduledAt,
      status: {
        notIn: ["CANCELLED", "COMPLETED"],
      },
    },
  });
};
