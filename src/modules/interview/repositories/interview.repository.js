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

/**
 * Finds a root interview process by ID.
 */
export const findRootInterviewById = async (interviewId, tx = prisma) => {
  return tx.interview.findFirst({
    where: {
      id: interviewId,
      parentInterviewId: null, // Ensure it's a root interview
    },
    include: {
      job: {
        include: { company: true },
      },
      application: {
        include: { candidate: true },
      },
    }
  });
};

/**
 * Finds the highest round number currently existing for an interview process.
 */
export const findHighestRoundNumber = async (parentInterviewId, tx = prisma) => {
  const result = await tx.interview.aggregate({
    where: { parentInterviewId },
    _max: { roundNumber: true },
  });
  
  // If there are no child rounds, the root interview is round 1.
  return result._max.roundNumber || 1;
};

/**
 * Finds an interview and all its child rounds, ordered by sequence.
 */
export const findInterviewProcessWithRounds = async (interviewId, tx = prisma) => {
  return tx.interview.findFirst({
    where: { id: interviewId },
    include: {
      application: true,
      company: true,
      candidate: true,
      job: true,
      scheduledBy: true,
      childRounds: {
        orderBy: { sequence: 'asc' },
        include: {
          scheduledBy: true,
        }
      }
    }
  });
};

/**
 * Finds all root interviews for a specific application.
 */
export const findRootInterviewsByApplication = async (applicationId, tx = prisma) => {
  return tx.interview.findMany({
    where: { 
      applicationId,
      parentInterviewId: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      scheduledBy: true,
      childRounds: {
        orderBy: { sequence: 'asc' },
        include: {
          scheduledBy: true,
        }
      }
    }
  });
};

