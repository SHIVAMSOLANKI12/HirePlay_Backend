import prisma from "../../../config/prisma.js";

export const createJob = async (jobData) => {
  return prisma.job.create({
    data: jobData,
  });
};

export const findAllJobs = async ({ where, skip, take, orderBy }) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    prisma.job.count({ where }),
  ]);

  return { items, totalCount };
};

export const findJobById = async (companyId, jobId) => {
  return prisma.job.findFirst({
    where: {
      id: jobId,
      companyId,
      deletedAt: null,
    },
  });
};

export const findPublishedJob = async (jobId) => {
  return prisma.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
      status: "PUBLISHED",
    },
  });
};

export const findJobByIdForCandidate = async (jobId) => {
  return prisma.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
    },
  });
};

export const findActiveJobById = async (jobId) => {
  return prisma.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
    },
  });
};

export const updateJob = async (jobId, data) => {
  return prisma.job.update({
    where: { id: jobId },
    data,
  });
};

export const softDeleteJob = async (jobId) => {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      deletedAt: new Date(),
      status: "ARCHIVED",
    },
  });
};
