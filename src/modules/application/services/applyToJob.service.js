import AppError from "../../../utils/AppError.js";
import { findJobByIdForCandidate } from "../../job/repositories/job.repository.js";
import { findExistingApplication, createApplication } from "../repositories/application.repository.js";
import { findResumeById } from "../../resume/repositories/resume.repository.js";

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
  const resume = await findResumeById(applicationData.resumeId);
  if (!resume) {
    throw new AppError("Invalid Resume", 404);
  }
  
  if (resume.candidateId !== candidateId) {
    throw new AppError("Resume belongs to another candidate", 403);
  }

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

  const newApplication = await createApplication(data);

  return {
    applicationId: newApplication.id,
    status: newApplication.status,
  };
};
