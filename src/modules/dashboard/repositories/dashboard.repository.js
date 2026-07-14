import prisma from "../../../config/prisma.js";

/**
 * Groups and counts the candidate's applications by status.
 */
export const getApplicationCounts = async (candidateId, options = { cache: true }) => {
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
export const getRecentApplications = async (candidateId, options = { cache: false }) => {
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
export const getJobStatistics = async (companyId, options = { cache: true }) => {
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
export const getCompanyApplicationStatistics = async (companyId, options = { cache: true }) => {
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
export const getRecentJobs = async (companyId, options = { cache: false }) => {
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
export const getRecentCompanyApplications = async (companyId, options = { cache: false }) => {
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

/**
 * Fetches application timestamps for a specific year to calculate monthly metrics.
 */
export const getMonthlyApplications = async (companyId, year, options = { cache: true }) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  return prisma.application.findMany({
    where: {
      job: {
        companyId,
      },
      appliedAt: {
        gte: startDate,
        lt: endDate,
      },
      deletedAt: null,
    },
    select: {
      appliedAt: true,
    },
  });
};

/**
 * Fetches job timestamps for a specific year to calculate monthly metrics.
 */
export const getMonthlyJobs = async (companyId, year, options = { cache: true }) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  return prisma.job.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
      deletedAt: null,
    },
    select: {
      createdAt: true,
    },
  });
};

/**
 * Fetches recent activities for a Candidate.
 */
export const getCandidateActivities = async (candidateId, options = { cache: false }) => {
  return prisma.activityLog.findMany({
    where: {
      userId: candidateId,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      createdAt: true,
      job: {
        select: {
          id: true,
          title: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  });
};

/**
 * Fetches recent activities for a Recruiter's Company.
 */
export const getRecruiterActivities = async (companyId, options = { cache: false }) => {
  return prisma.activityLog.findMany({
    where: {
      companyId,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      createdAt: true,
      user: {
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
