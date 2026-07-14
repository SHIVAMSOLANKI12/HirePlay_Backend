import AppError from "../../../utils/AppError.js";
import { findJobByIdForCandidate } from "../../job/repositories/job.repository.js";
import { findExistingApplication, createApplication } from "../repositories/application.repository.js";
import { findResumeById } from "../../resume/repositories/resume.repository.js";
import { verifyCandidateOwnership } from "../../shared/services/verifyCandidateOwnership.service.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import prisma from "../../../config/prisma.js";

export const applyToJob = async (candidateId, jobId, applicationData) => {
  // Fetch Job
  const job = await findJobByIdForCandidate(jobId);
  
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  // Verify Published
  if (job.status !== "PUBLISHED") {
    throw new AppError("Job is not published", 409);
  }

  // Verify Deadline
  if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
    throw new AppError("Application deadline has expired", 409);
  }

  // Check Duplicate Application
  const existingApplication = await findExistingApplication(candidateId, jobId);
  if (existingApplication) {
    throw new AppError("Candidate has already applied", 409);
  }

  // Validate Resume
  const resume = await verifyCandidateOwnership(applicationData.resumeId, candidateId, findResumeById, "Resume");

  if (!resume.isActive || resume.deletedAt) {
    throw new AppError("Invalid Resume", 404);
  }

  // Create Application
  const data = {
    candidateId,
    jobId,
    resumeId: applicationData.resumeId,
    coverLetter: applicationData.coverLetter,
    status: "APPLIED",
  };

  // Run Application Creation and Activity Logging in a transaction
  const newApplication = await prisma.$transaction(async (tx) => {
    const app = await createApplication(data, tx);

    await logApplicationActivity({
      applicationId: app.id,
      performedBy: candidateId,
      action: "APPLICATION_CREATED",
      newStatus: "APPLIED",
      metadata: {
        jobId,
        candidateId,
        resumeId: applicationData.resumeId,
      },
    }, tx);

    return app;
  });

  return {
    applicationId: newApplication.id,
    status: newApplication.status,
  };
};
