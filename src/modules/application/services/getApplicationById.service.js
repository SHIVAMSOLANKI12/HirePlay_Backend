import { verifyCandidateOwnership } from "../../shared/services/verifyCandidateOwnership.service.js";
import prisma from "../../../config/prisma.js";
import { toDetails } from "../../shared/mappers/application.mapper.js";

const fetchApplicationWithDetails = async (id) => {
  return prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      candidateId: true,
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

export const getApplicationByIdService = async (applicationId, candidateId) => {
  const application = await verifyCandidateOwnership(
    applicationId,
    candidateId,
    fetchApplicationWithDetails,
    "Application"
  );

  // Exclude soft-deleted applications
  if (application.deletedAt) {
    const AppError = (await import("../../../utils/AppError.js")).default;
    throw new AppError("Application not found", 404);
  }

  return toDetails(application);
};
