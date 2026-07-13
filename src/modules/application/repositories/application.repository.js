import prisma from "../../../config/prisma.js";

export const findExistingApplication = async (candidateId, jobId) => {
  return prisma.application.findFirst({
    where: {
      candidateId,
      jobId,
      deletedAt: null,
    },
  });
};

export const createApplication = async (data) => {
  return prisma.application.create({
    data,
  });
};

export const findApplicationsByCandidateId = async (
  candidateId,
  { page, limit, status, search, sortBy = "appliedAt", sortOrder = "desc" }
) => {
  const where = {
    candidateId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.job = {
      title: { contains: search, mode: "insensitive" },
    };
  }

  const skip = (page - 1) * limit;

  const [items, totalCount] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            workMode: true,
            employmentType: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            fileUrl: true,
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return { items, totalCount };
};

export const findApplicationByIdAndCandidateId = async (applicationId, candidateId) => {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      candidateId,
      deletedAt: null,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          workMode: true,
          employmentType: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
      resume: {
        select: {
          id: true,
          fileName: true,
          originalName: true,
          fileUrl: true,
        },
      },
    },
  });
};

export const withdrawApplication = async (applicationId) => {
  return prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
      withdrawnAt: new Date(),
    },
  });
};
