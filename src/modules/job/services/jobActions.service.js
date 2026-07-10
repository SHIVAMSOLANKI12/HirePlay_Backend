import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findJobById, updateJob } from "../repositories/job.repository.js";
import JobDTO from "../dto/job.dto.js";

const VALID_TRANSITIONS = {
  PUBLISHED: ["DRAFT", "CLOSED"], // Can become PUBLISHED if it was DRAFT or CLOSED
  DRAFT: ["PUBLISHED"],           // Can become DRAFT if it was PUBLISHED (unpublish)
  CLOSED: ["PUBLISHED"],          // Can become CLOSED if it was PUBLISHED
};

export const changeJobStatusService = async (user, jobId, newStatus) => {
  let companyId = user.companyId;

  // Fetch companyId for Company Admin / Owner
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to modify jobs.", 404);
  }

  const existingJob = await findJobById(companyId, jobId);

  if (!existingJob) {
    throw new AppError("Job not found or belongs to another company.", 404);
  }

  const currentStatus = existingJob.status;

  // Validate state transition
  const allowedPreviousStates = VALID_TRANSITIONS[newStatus];
  if (!allowedPreviousStates || !allowedPreviousStates.includes(currentStatus)) {
    throw new AppError(
      `Invalid state transition from ${currentStatus} to ${newStatus}.`,
      409
    );
  }

  const dataToUpdate = { status: newStatus };

  // Specific rule for publishing
  if (newStatus === "PUBLISHED" && currentStatus === "DRAFT") {
    dataToUpdate.publishedAt = new Date();
  }

  const updatedJob = await updateJob(jobId, dataToUpdate);

  return JobDTO.toResponse(updatedJob);
};
