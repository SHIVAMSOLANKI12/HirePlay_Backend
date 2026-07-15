import prisma from "../../../config/prisma.js";
import AppError from "../../../utils/AppError.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";

/**
 * Centralized service to verify that an interview exists and that the user has
 * access to the underlying job. This eliminates N+1 query patterns that
 * previously required fetching the entire Job and Company models just to
 * authorize access.
 * 
 * Returns the raw interview model if successful.
 */
export const verifyInterviewAccess = async (user, interviewId) => {
  // Validate ID format
  const uuidValidation = uuidSchema("Invalid Interview ID").safeParse(interviewId);
  if (!uuidValidation.success) {
    throw new AppError("Invalid Interview ID", 400);
  }

  // Fetch only the absolutely required fields for authorization and standard checks
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: {
      id: true,
      jobId: true,
      status: true,
      isFinalRound: true,
      companyId: true,
      applicationId: true,
      candidateId: true,
      title: true,
      decision: true,
      parentInterviewId: true,
      scheduledAt: true
    }
  });

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  // Ensure recruiter has access to this specific job
  await verifyRecruiterJobAccess(user, interview.jobId);

  return interview;
};
