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

export const createApplication = async (data, tx = prisma) => {
  return tx.application.create({
    data,
  });
};

export const findApplicationsByCandidateId = async ({ where, skip, take, orderBy }) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalName: true,
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
    select: {
      id: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      coverLetter: true,
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
      candidate: {
        select: {
          id: true,
          name: true,
        },
      },
      resume: {
        select: {
          id: true,
          originalName: true,
        },
      },
    },
  });
};

export const withdrawApplication = async (applicationId, tx = prisma) => {
  return tx.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
      withdrawnAt: new Date(),
    },
  });
};

export const findApplicantsByJobId = async ({ where, skip, take, orderBy }) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return { items, totalCount };
};

export const findApplicationById = async (applicationId) => {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      deletedAt: null,
    },
    select: {
      id: true,
      jobId: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      coverLetter: true,
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
      candidate: {
        select: {
          id: true,
          name: true,
        },
      },
      resume: {
        select: {
          id: true,
          originalName: true,
        },
      },
    },
  });
};

export const updateApplicationStatus = async (applicationId, status, tx = prisma) => {
  return tx.application.update({
    where: { id: applicationId },
    data: { status },
    select: {
      id: true,
      status: true,
      updatedAt: true,
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
      resume: {
        select: {
          id: true,
          originalName: true,
        },
      },
    },
  });
};

export const findRecruiterApplicationDetails = async (applicationId) => {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      deletedAt: null,
    },
    select: {
      id: true,
      jobId: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      coverLetter: true,
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          location: true,
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
          originalName: true,
          fileUrl: true,
        },
      },
    },
  });
};
