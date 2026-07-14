import prisma from "../../../config/prisma.js";

/**
 * Groups and counts the candidate's applications by status.
 */
export const getApplicationCounts = async (candidateId) => {
  return prisma.application.groupBy({
    by: ['status'],
    where: {
      candidateId,
      deletedAt: null,
    },
    _count: {
      id: true,
    },
  });
};

/**
 * Fetches the 5 most recent applications for the candidate with job/company details.
 */
export const getRecentApplications = async (candidateId) => {
  return prisma.application.findMany({
    where: {
      candidateId,
      deletedAt: null,
    },
    take: 5,
    orderBy: {
      appliedAt: "desc",
    },
    select: {
      id: true,
      status: true,
      appliedAt: true,
      job: {
        select: {
          id: true,
          title: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
    },
  });
};
