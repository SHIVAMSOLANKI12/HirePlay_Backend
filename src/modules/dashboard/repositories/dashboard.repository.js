import prisma from "../../../config/prisma.js";

/**
 * Groups and counts the candidate's applications by status.
 */
export const getApplicationCounts = async (candidateId) => {
  // Use _count: { _all: true } to avoid ambiguous "id" column in PostgreSQL
  const result = await prisma.application.groupBy({
    by: ['status'],
    where: {
      candidateId,
      deletedAt: null,
    },
    _count: {
      _all: true,
    },
  });

  // Map _all back to id to maintain compatibility with existing mapper
  return result.map((group) => ({
    ...group,
    _count: {
      id: group._count._all,
    },
  }));
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

/**
 * Groups and counts the company's jobs by status.
 */
export const getJobStatistics = async (companyId) => {
  // Use _count: { _all: true } to avoid ambiguous "id" column in PostgreSQL
  const result = await prisma.job.groupBy({
    by: ['status'],
    where: {
      companyId,
      deletedAt: null,
    },
    _count: {
      _all: true,
    },
  });

  // Map _all back to id to maintain compatibility with existing mapper
  return result.map((group) => ({
    ...group,
    _count: {
      id: group._count._all,
    },
  }));
};

/**
 * Groups and counts the company's applications by status.
 */
export const getCompanyApplicationStatistics = async (companyId) => {
  // Use _count: { _all: true } to avoid ambiguous "id" column in PostgreSQL
  // This explicitly fixes the code: 42702 PostgreSQL error caused by relation joins in groupBy
  const result = await prisma.application.groupBy({
    by: ['status'],
    where: {
      job: {
        companyId,
      },
      deletedAt: null,
    },
    _count: {
      _all: true,
    },
  });

  // Map _all back to id to maintain compatibility with existing mapper
  return result.map((group) => ({
    ...group,
    _count: {
      id: group._count._all,
    },
  }));
};

/**
 * Fetches the 5 most recent jobs for the company.
 */
export const getRecentJobs = async (companyId) => {
  return prisma.job.findMany({
    where: {
      companyId,
      deletedAt: null,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
  });
};

/**
 * Fetches the 5 most recent applications received across all company jobs.
 */
export const getRecentCompanyApplications = async (companyId) => {
  return prisma.application.findMany({
    where: {
      job: {
        companyId,
      },
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
      candidate: {
        select: {
          id: true,
          name: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};
