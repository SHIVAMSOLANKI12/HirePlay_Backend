import AppError from "../../../utils/AppError.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import {
  findCompanyByOwnerId,
  findCompanyBySlug,
  updateCompany as updateCompanyRepo,
} from "../repositories/company.repository.js";
import CompanyMapper from "../mappers/company.mapper.js";
import CompanyDTO from "../dto/company.dto.js";
import { generateUniqueSlug } from "../../../shared/utils/slug.util.js";

export const updateCompanyService = async (payload, ownerId) => {
  if (!ownerId) {
    throw new AppError(COMPANY_MESSAGES.UNAUTHORIZED, COMPANY_HTTP_STATUS.UNAUTHORIZED);
  }

  const existingCompany = await findCompanyByOwnerId(ownerId);

  if (!existingCompany) {
    throw new AppError(COMPANY_MESSAGES.NOT_FOUND, COMPANY_HTTP_STATUS.NOT_FOUND);
  }

  const updateData = CompanyMapper.toUpdateData(payload);

  // If company name changes, generate a new unique slug
  if (updateData.name && updateData.name !== existingCompany.name) {
    updateData.slug = await generateUniqueSlug(findCompanyBySlug, updateData.name);
  }

  const updatedCompany = await updateCompanyRepo(existingCompany.id, updateData);

  return CompanyDTO.toResponse(updatedCompany);
};
