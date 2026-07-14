import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findAllJobs } from "../repositories/job.repository.js";
import { getPaginationOptions, getPaginationMetadata } from "../../shared/services/pagination.service.js";
import { buildSearchCondition } from "../../shared/services/search.service.js";
import { getSortingOptions } from "../../shared/services/sorting.service.js";
import JobDTO from "../dto/job.dto.js";

export const getAllJobsService = async (user, queryParams) => {
  let companyId = user.companyId;

  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to view jobs.", 404);
  }

  const {
    page,
    limit,
    status,
    employmentType,
    search,
    sortBy,
    sortOrder,
  } = queryParams;

  const { page: parsedPage, limit: parsedLimit, skip, take } = getPaginationOptions(page, limit);
  const orderBy = getSortingOptions(sortBy, sortOrder, ["createdAt", "updatedAt", "title", "status"], "createdAt");
  const searchCondition = buildSearchCondition(search, ["title"]);

  const where = {
    companyId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(searchCondition ? { ...searchCondition } : {}),
  };

  const { items, totalCount } = await findAllJobs({
    where,
    skip,
    take,
    orderBy,
  });

  const mappedItems = items.map((job) => JobDTO.toResponse(job));
  const pagination = getPaginationMetadata(totalCount, parsedPage, parsedLimit);

  return {
    items: mappedItems,
    pagination,
  };
};
