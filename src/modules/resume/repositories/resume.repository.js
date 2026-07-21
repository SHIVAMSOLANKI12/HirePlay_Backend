import prisma from "../../../config/prisma.js";

export const createResume = async (data) => {
  return await prisma.resume.create({
    data,
  });
};

export const createResumeWithDeactivation = async (candidateId, resumeData) => {
  return await prisma.$transaction(async (tx) => {
    await tx.resume.updateMany({
      where: {
        candidateId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return await tx.resume.create({
      data: resumeData,
    });
  });
};

export const getActiveResumeByCandidateId = async (candidateId, includeParsedData = false) => {
  const query = {
    where: {
      candidateId,
      isActive: true,
      deletedAt: null,
    },
  };

  if (!includeParsedData) {
    query.select = {
      id: true,
      candidateId: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      fileSize: true,
      fileUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      parsingStatus: true,
      aiScore: true,
      aiScoreStatus: true,
      scoringProvider: true,
      parsedAt: true,
      parserVersion: true,
      parsingError: true
      // parsedData is intentionally excluded for performance
    };
  }

  return await prisma.resume.findFirst(query);
};

export const findResumeById = async (id, includeParsedData = false) => {
  const query = {
    where: { id },
  };

  if (!includeParsedData) {
    query.select = {
      id: true,
      candidateId: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      fileSize: true,
      fileUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      parsingStatus: true,
      aiScore: true,
      aiScoreStatus: true,
      scoringProvider: true,
      parsedAt: true,
      parserVersion: true,
      parsingError: true
      // parsedData is excluded for performance
    };
  }

  return await prisma.resume.findUnique(query);
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


