import prisma from "../../../config/prisma.js";

export const createCompany = async (data) => {
  return prisma.company.create({
    data,
  });
};

export const findCompanyByOwnerId = async (ownerId) => {
  return prisma.company.findFirst({
    where: {
      ownerId,
      deletedAt: null,
    },
  });
};

export const findCompanyBySlug = async (slug) => {
  return prisma.company.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
  });
};

export const findCompanyById = async (id) => {
  return prisma.company.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const updateCompany = async (id, data) => {
  return prisma.company.update({
    where: {
      id,
    },
    data,
  });
};

export const softDelete = async (id) => {
  return prisma.company.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const getCompanySettings = async (companyId) => {
  return prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      timezone: true,
      language: true,
      currency: true,
      dateFormat: true,
      timeFormat: true,
      emailNotifications: true,
      smsNotifications: true,
      careerPagePublic: true,
      defaultHiringStage: true,
    }
  });
};

export const updateCompanySettings = async (companyId, data) => {
  return prisma.company.update({
    where: {
      id: companyId,
    },
    data,
  });
};