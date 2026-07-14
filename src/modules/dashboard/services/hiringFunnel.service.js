import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { getCompanyApplicationStatistics } from "../repositories/dashboard.repository.js";
import { toHiringFunnel } from "../mappers/dashboard.mapper.js";

/**
 * Service to calculate the Hiring Funnel Analytics for a company
 */
export const getHiringFunnelService = async (user) => {
  let companyId = user.companyId;

  // Resolve companyId for COMPANY_ADMIN
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found for the user", 404);
  }

  // Reuse the highly optimized repository function
  const appStats = await getCompanyApplicationStatistics(companyId);

  return toHiringFunnel(appStats);
};
