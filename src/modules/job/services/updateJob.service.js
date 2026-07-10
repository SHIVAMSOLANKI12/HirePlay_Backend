import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findJobById, updateJob } from "../repositories/job.repository.js";
import JobDTO from "../dto/job.dto.js";

export const updateJobService = async (user, jobId, payload) => {
  let companyId = user.companyId;

  // If companyId is not in JWT (e.g., Company Admin / Owner), fetch it
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to update jobs.", 404);
  }

  const existingJob = await findJobById(companyId, jobId);

  if (!existingJob) {
    throw new AppError("Job not found or belongs to another company.", 404);
  }

  const dataToUpdate = { ...payload };

  // If status is being updated to PUBLISHED and it wasn't PUBLISHED before, set publishedAt
  if (dataToUpdate.status === "PUBLISHED" && existingJob.status !== "PUBLISHED") {
    dataToUpdate.publishedAt = new Date();
  }

  // Ensure salaryMax is valid with existing salaryMin if only one is updated
  const newSalaryMin = dataToUpdate.salaryMin !== undefined ? dataToUpdate.salaryMin : existingJob.salaryMin;
  const newSalaryMax = dataToUpdate.salaryMax !== undefined ? dataToUpdate.salaryMax : existingJob.salaryMax;

  if (newSalaryMin !== null && newSalaryMax !== null && newSalaryMax < newSalaryMin) {
    throw new AppError("Maximum salary must be greater than or equal to minimum salary.", 400);
  }

  const updatedJob = await updateJob(jobId, dataToUpdate);

  return JobDTO.toResponse(updatedJob);
};
