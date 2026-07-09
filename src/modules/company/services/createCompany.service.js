import AppError from "../../../utils/AppError.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import CompanyDTO from "../dto/company.dto.js";
import CompanyMapper from "../mappers/company.mapper.js";
import { generateUniqueSlug } from "../../../shared/utils/slug.util.js";
import {
  createCompany as createCompanyRepo,
  findCompanyByOwnerId,
  findCompanyBySlug,
} from "../repositories/company.repository.js";

export const createCompanyService = async (payload, ownerId) => {
  // 1. Check authentication
  if (!ownerId) {
    throw new AppError(COMPANY_MESSAGES.UNAUTHORIZED, COMPANY_HTTP_STATUS.UNAUTHORIZED);
  }

  // 2. Check if owner already has a company
  const existingCompany = await findCompanyByOwnerId(ownerId);

  if (existingCompany) {
    throw new AppError(COMPANY_MESSAGES.OWNER_ALREADY_HAS_COMPANY, COMPANY_HTTP_STATUS.CONFLICT);
  }

  // 3. Generate unique slug
  const slug = await generateUniqueSlug(findCompanyBySlug, payload.name);

  // 4. Create company
  const data = CompanyMapper.toCreateData(
    payload,
    slug,
    ownerId
  );

  const company = await createCompanyRepo(data);

  // 5. Return response
return CompanyDTO.toResponse(company);
};