import prisma from "../../../config/prisma.js";

export const createHR = async (data) => {
  return prisma.hR.create({
    data,
  });
};

export const findHRByEmail = async (email) => {
  return prisma.hR.findUnique({
    where: {
      email,
    },
  });
};

export const findAllHRs = async (companyId, { page, limit, search, status, sortBy, sortOrder }) => {
  const where = {
    companyId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { designation: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, totalCount] = await prisma.$transaction([
    prisma.hR.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.hR.count({ where }),
  ]);

  return { items, totalCount };
};

export const findHRById = async (companyId, hrId) => {
  return prisma.hR.findFirst({
    where: {
      id: hrId,
      companyId,
      deletedAt: null,
    },
  });
};

export const updateHR = async (hrId, data) => {
  return prisma.hR.update({
    where: {
      id: hrId,
    },
    data,
  });
};

export const softDeleteHR = async (hrId) => {
  return prisma.hR.update({
    where: {
      id: hrId,
    },
    data: {
      deletedAt: new Date(),
      status: "INACTIVE",
    },
  });
};
