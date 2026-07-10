import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findJobById } from "../repositories/job.repository.js";
import JobDTO from "../dto/job.dto.js";

export const getJobByIdService = async (user, jobId) => {
  let companyId = user.companyId;

  // If companyId is not in JWT (e.g., Company Admin / Owner), fetch it
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to view jobs.", 404);
  }

  const job = await findJobById(companyId, jobId);

  if (!job) {
    throw new AppError("Job not found or belongs to another company.", 404);
  }

  return JobDTO.toResponse(job);
};
