import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findAllJobs } from "../repositories/job.repository.js";
import JobDTO from "../dto/job.dto.js";

export const getAllJobsService = async (user, queryParams) => {
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

  // Fetch paginated active jobs for this company
  const { items, totalCount } = await findAllJobs(companyId, queryParams);

  // Map to DTOs
  const mappedItems = items.map((job) => JobDTO.toResponse(job));

  const totalPages = Math.ceil(totalCount / queryParams.limit);

  return {
    items: mappedItems,
    pagination: {
      page: queryParams.page,
      limit: queryParams.limit,
      totalItems: totalCount,
      totalPages: totalPages,
      hasNextPage: queryParams.page < totalPages,
      hasPreviousPage: queryParams.page > 1,
    },
  };
};
