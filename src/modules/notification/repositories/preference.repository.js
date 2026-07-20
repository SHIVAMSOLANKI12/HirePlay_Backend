import prisma from "../../../config/prisma.js";

export const getPreferenceByUserId = async (userId, companyId) => {
  return prisma.notificationPreference.findFirst({
    where: {
      userId,
      companyId,
      deletedAt: null
    }
  });
};

export const createDefaultPreference = async (userId, companyId) => {
  return prisma.notificationPreference.create({
    data: {
      userId,
      companyId
    }
  });
};

export const updatePreferenceByUserId = async (userId, companyId, data) => {
  return prisma.notificationPreference.update({
    where: {
      userId
    },
    data
  });
};
