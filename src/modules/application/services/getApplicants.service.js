import AppError from "../../../utils/AppError.js";
import { findApplicantsByJobId } from "../repositories/application.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { getPaginationOptions, getPaginationMetadata } from "../../shared/services/pagination.service.js";
import { buildSearchCondition } from "../../shared/services/search.service.js";
import { getSortingOptions } from "../../shared/services/sorting.service.js";
import { toList, toSummary } from "../../shared/mappers/application.mapper.js";

export const getApplicantsService = async (user, jobId, queryParams) => {
  // Verify Job existence and ownership
  const job = await verifyRecruiterJobAccess(user, jobId);

  const {
    page,
    limit,
    status,
    search,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    hasResume,
  } = queryParams;

  const { page: parsedPage, limit: parsedLimit, skip, take } = getPaginationOptions(page, limit);
  
  // Custom sorting logic for candidateName
  let orderBy = {};
  const orderDirection = ["asc", "desc"].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : "desc";
  if (sortBy === "candidateName") {
    orderBy = { candidate: { name: orderDirection } };
  } else if (sortBy === "status") {
    orderBy = { status: orderDirection };
  } else {
    orderBy = { appliedAt: orderDirection };
  }
  
  const searchCondition = buildSearchCondition(search, ["candidate.name", "candidate.email", "resume.originalName"]);

  const where = {
    jobId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(searchCondition ? { ...searchCondition } : {}),
  };

  if (dateFrom || dateTo) {
    where.appliedAt = {};
    if (dateFrom) where.appliedAt.gte = new Date(dateFrom);
    if (dateTo) where.appliedAt.lte = new Date(dateTo);
  }

  if (hasResume !== undefined) {
    if (hasResume) {
      where.resumeId = { not: null };
    } else {
      where.resumeId = null;
    }
  }

  const { items, totalCount } = await findApplicantsByJobId({
    where,
    skip,
    take,
    orderBy,
  });

  const pagination = getPaginationMetadata(totalCount, parsedPage, parsedLimit);

  return {
    data: toList(items, toSummary),
    applicants: toList(items, toSummary), // Kept for backward compatibility
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.totalItems,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNextPage,
      hasPrevious: pagination.hasPreviousPage,
    },
  };
};
