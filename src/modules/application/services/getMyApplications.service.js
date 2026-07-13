import { findApplicationsByCandidateId } from "../repositories/application.repository.js";

export const getMyApplicationsService = async (candidateId, queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = "appliedAt",
    sortOrder = "desc",
  } = queryParams;

  const parsedPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  const parsedLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

  const { items, totalCount } = await findApplicationsByCandidateId(candidateId, {
    page: parsedPage,
    limit: parsedLimit,
    status,
    search,
    sortBy,
    sortOrder,
  });

  const totalPages = Math.ceil(totalCount / parsedLimit);

  return {
    applications: items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total: totalCount,
      totalPages,
    },
  };
};
