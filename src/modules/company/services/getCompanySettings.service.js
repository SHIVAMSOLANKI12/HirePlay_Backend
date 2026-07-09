import AppError from "../../../utils/AppError.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { findCompanyByOwnerId, getCompanySettings } from "../repositories/company.repository.js";
import CompanyDTO from "../dto/company.dto.js";

export const getCompanySettingsService = async (ownerId) => {
  if (!ownerId) {
    throw new AppError(COMPANY_MESSAGES.UNAUTHORIZED, COMPANY_HTTP_STATUS.UNAUTHORIZED);
  }

  const existingCompany = await findCompanyByOwnerId(ownerId);

  if (!existingCompany) {
    throw new AppError(COMPANY_MESSAGES.NOT_FOUND, COMPANY_HTTP_STATUS.NOT_FOUND);
  }

  const settings = await getCompanySettings(existingCompany.id);

  return CompanyDTO.toSettingsResponse(settings);
};
