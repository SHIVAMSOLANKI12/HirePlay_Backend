import AppError from "../../../utils/AppError.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { findCompanyByOwnerId } from "../repositories/company.repository.js";
import CompanyDTO from "../dto/company.dto.js";

class GetCompanyService {
  async execute(ownerId) {
    if (!ownerId) {
      throw new AppError(COMPANY_MESSAGES.UNAUTHORIZED, COMPANY_HTTP_STATUS.UNAUTHORIZED);
    }

    const company = await findCompanyByOwnerId(ownerId);

    if (!company) {
      throw new AppError(COMPANY_MESSAGES.NOT_FOUND, COMPANY_HTTP_STATUS.NOT_FOUND);
    }

    return CompanyDTO.toResponse(company);
  }
}

export default new GetCompanyService();