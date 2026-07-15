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
    select: {
      id: true,
      jobId: true,
      job: {
        select: { id: true, title: true, companyId: true, company: { select: { id: true, name: true } } }
      },
      applicationId: true,
      application: {
        select: { id: true, candidateId: true, candidate: { select: { id: true, name: true, email: true } } }
      },
      status: true,
      roundNumber: true,
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
    select: {
      id: true,
      applicationId: true,
      companyId: true,
      candidateId: true,
      jobId: true,
      status: true,
      title: true,
      scheduledAt: true,
      application: { select: { id: true, status: true } },
      company: { select: { id: true, name: true } },
      candidate: { select: { id: true, name: true, email: true } },
      job: { select: { id: true, title: true } },
      scheduledBy: { select: { id: true, name: true } },
      childRounds: {
        orderBy: { sequence: 'asc' },
        select: {
          id: true,
          status: true,
          title: true,
          roundNumber: true,
          scheduledAt: true,
          scheduledBy: { select: { id: true, name: true } },
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
    select: {
      id: true,
      status: true,
      title: true,
      scheduledAt: true,
      createdAt: true,
      scheduledBy: { select: { id: true, name: true } },
      childRounds: {
        orderBy: { sequence: 'asc' },
        select: {
          id: true,
          status: true,
          title: true,
          scheduledAt: true,
          scheduledBy: { select: { id: true, name: true } },
        }
      }
    }
  });
};

