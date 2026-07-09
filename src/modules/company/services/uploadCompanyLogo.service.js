import AppError from "../../../utils/AppError.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { findCompanyByOwnerId, updateCompany } from "../repositories/company.repository.js";
import CompanyDTO from "../dto/company.dto.js";
import storageService from "../../../shared/storage/index.js";

export const uploadCompanyLogoService = async (ownerId, file) => {
  if (!ownerId) {
    throw new AppError(COMPANY_MESSAGES.UNAUTHORIZED, COMPANY_HTTP_STATUS.UNAUTHORIZED);
  }

  if (!file) {
    throw new AppError("No logo file provided.", 400);
  }

  const existingCompany = await findCompanyByOwnerId(ownerId);

  if (!existingCompany) {
    throw new AppError(COMPANY_MESSAGES.NOT_FOUND, COMPANY_HTTP_STATUS.NOT_FOUND);
  }

  // Delete existing logo if one exists
  if (existingCompany.logo) {
    await storageService.delete(existingCompany.logo);
  }

  // Upload new logo using the generic storage service
  const uploadedLogoPath = await storageService.upload(file);

  // Update company record
  const updatedCompany = await updateCompany(existingCompany.id, { logo: uploadedLogoPath });

  return CompanyDTO.toResponse(updatedCompany);
};
