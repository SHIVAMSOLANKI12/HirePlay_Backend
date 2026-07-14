import { findApplicationsByCandidateId } from "../repositories/application.repository.js";
import { getPaginationOptions, getPaginationMetadata } from "../../shared/services/pagination.service.js";
import { buildSearchCondition } from "../../shared/services/search.service.js";
import { getSortingOptions } from "../../shared/services/sorting.service.js";
import { toList, toSummary } from "../../shared/mappers/application.mapper.js";

export const getMyApplicationsService = async (candidateId, queryParams) => {
  const {
    page,
    limit,
    status,
    search,
    sortBy,
    sortOrder,
  } = queryParams;

  const { page: parsedPage, limit: parsedLimit, skip, take } = getPaginationOptions(page, limit);
  const orderBy = getSortingOptions(sortBy, sortOrder, ["appliedAt", "status"], "appliedAt");
  const searchCondition = buildSearchCondition(search, ["job.title"]);

  const where = {
    candidateId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(searchCondition ? { ...searchCondition } : {}),
  };

  const { items, totalCount } = await findApplicationsByCandidateId({
    where,
    skip,
    take,
    orderBy,
  });

  const pagination = getPaginationMetadata(totalCount, parsedPage, parsedLimit);

  return {
    applications: toList(items, toSummary),
    pagination,
  };
};
