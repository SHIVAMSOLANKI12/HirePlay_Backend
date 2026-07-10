import prisma from "../../../config/prisma.js";

export const createJob = async (jobData) => {
  return prisma.job.create({
    data: jobData,
  });
};

export const findAllJobs = async (companyId, { page, limit, search, status, employmentType, sortBy, sortOrder }) => {
  const where = {
    companyId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (employmentType) {
    where.employmentType = employmentType;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const skip = (page - 1) * limit;

  const [items, totalCount] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
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
