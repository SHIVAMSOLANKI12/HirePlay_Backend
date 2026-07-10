import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findJobById, softDeleteJob } from "../repositories/job.repository.js";

export const softDeleteJobService = async (user, jobId) => {
  let companyId = user.companyId;

  // If companyId is not in JWT (e.g., Company Admin / Owner), fetch it
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to delete jobs.", 404);
  }

  const existingJob = await findJobById(companyId, jobId);

  if (!existingJob) {
    throw new AppError("Job not found, already deleted, or belongs to another company.", 404);
  }

  await softDeleteJob(jobId);

  return true;
};
