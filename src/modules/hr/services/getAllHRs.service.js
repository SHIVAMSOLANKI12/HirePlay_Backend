import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findAllHRs } from "../repositories/hr.repository.js";
import HRDTO from "../dto/hr.dto.js";

export const getAllHRsService = async (ownerId, queryParams) => {
  // Get authenticated company
  const existingCompany = await findCompanyByOwnerId(ownerId);
  if (!existingCompany) {
    throw new AppError("Company not found. Only company owners can view HRs.", 404);
  }

  // Fetch paginated active HRs for this company
  const { items, totalCount } = await findAllHRs(existingCompany.id, queryParams);

  // Map to DTOs
  const mappedItems = items.map((hr) => HRDTO.toResponse(hr));

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
