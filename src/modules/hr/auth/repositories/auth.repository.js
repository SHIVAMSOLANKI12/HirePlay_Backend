import prisma from "../../../../config/prisma.js";

export const findHRByEmailForAuth = async (email) => {
  return prisma.hR.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      companyId: true,
      status: true,
      isActive: true,
      deletedAt: true,
      firstName: true,
      lastName: true,
      refreshToken: true,
      refreshTokenExpiresAt: true,
      tokenVersion: true,
      company: {
        select: {
          deletedAt: true,
          ownerId: true,
        },
      },
    },
  });
};

export const updateLastLogin = async (hrId) => {
  return prisma.hR.update({
    where: { id: hrId },
    data: { lastLoginAt: new Date() },
  });
};

export const findHRByIdForAuth = async (hrId) => {
  return prisma.hR.findUnique({
    where: { id: hrId },
    select: {
      id: true,
      email: true,
      role: true,
      companyId: true,
      status: true,
      isActive: true,
      firstName: true,
      lastName: true,
      phone: true,
      designation: true,
      avatar: true,
      refreshToken: true,
      refreshTokenExpiresAt: true,
      tokenVersion: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};

export const updateRefreshToken = async (hrId, hashedToken, expiresAt) => {
  return prisma.hR.update({
    where: { id: hrId },
    data: {
      refreshToken: hashedToken,
      refreshTokenExpiresAt: expiresAt,
    },
  });
};

export const clearRefreshToken = async (hrId) => {
  return prisma.hR.update({
    where: { id: hrId },
    data: {
      refreshToken: null,
      refreshTokenExpiresAt: null,
      tokenVersion: {
        increment: 1,
      },
      lastLogoutAt: new Date(),
    },
  });
};

export const updatePassword = async (hrId, newHashedPassword) => {
  return prisma.hR.update({
    where: { id: hrId },
    data: {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
      refreshToken: null,
      refreshTokenExpiresAt: null,
      tokenVersion: {
        increment: 1,
      },
    },
  });
};

export const storeResetToken = async (hrId, hashedToken, expiresAt) => {
  return prisma.hR.update({
    where: { id: hrId },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: expiresAt,
    },
  });
};

export const findByResetToken = async (hashedToken) => {
  return prisma.hR.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  });
};

export const clearResetToken = async (hrId) => {
  return prisma.hR.update({
    where: { id: hrId },
    data: {
      passwordResetToken: null,
      passwordResetExpiresAt: null,
      tokenVersion: {
        increment: 1,
      },
      refreshToken: null,
      refreshTokenExpiresAt: null,
    },
  });
};
