import prisma from "../../../config/prisma.js";

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createRefreshToken = async (data) => {
  return prisma.refreshToken.create({
    data,
  });
};

export const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: {
      token,
    },
  });
};

export const revokeRefreshToken = async (token) => {
  return prisma.refreshToken.update({
    where: {
      token,
    },
    data: {
      isRevoked: true,
    },
  });
};

export const revokeAllRefreshTokens = async (userId) => {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
    },
  });
};