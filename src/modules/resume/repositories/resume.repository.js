import prisma from "../../../config/prisma.js";

export const createResume = async (data) => {
  return await prisma.resume.create({
    data,
  });
};

export const getActiveResumeByCandidateId = async (candidateId) => {
  return await prisma.resume.findFirst({
    where: {
      candidateId,
      isActive: true,
      deletedAt: null,
    },
  });
};

export const findResumeById = async (id) => {
  return await prisma.resume.findUnique({
    where: { id },
  });
};

export const updateResume = async (id, data) => {
  return await prisma.resume.update({
    where: { id },
    data,
  });
};

export const deactivateResumesByCandidateId = async (candidateId) => {
  return await prisma.resume.updateMany({
    where: {
      candidateId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
};

export const softDeleteResume = async (id) => {
  return await prisma.resume.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};
