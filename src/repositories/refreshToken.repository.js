import prisma from "../config/prisma.js";

export const createRefreshToken = async (data) => {
  return prisma.refreshToken.create({
    data,
  });
};

export const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
  });
};

export const deleteRefreshToken = async (token) => {
  return prisma.refreshToken.delete({
    where: { token },
  });
};

export const deleteUserRefreshTokens = async (userId) => {
  return prisma.refreshToken.deleteMany({
    where: { userId },
  });
};