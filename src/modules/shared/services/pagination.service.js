import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "../constants/pagination.constants.js";

export const getPaginationOptions = (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
  const parsedPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : DEFAULT_PAGE;
  let parsedLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : DEFAULT_LIMIT;
  if (parsedLimit > MAX_LIMIT) parsedLimit = MAX_LIMIT;
  
  const skip = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, skip, take: parsedLimit };
};

export const getPaginationMetadata = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
