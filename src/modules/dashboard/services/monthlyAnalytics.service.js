import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { 
  getCompanyApplicationStatistics, 
  getMonthlyApplications, 
  getMonthlyJobs 
} from "../repositories/dashboard.repository.js";
import { toMonthlyAnalytics } from "../mappers/dashboard.mapper.js";

/**
 * Service to aggregate monthly dashboard metrics
 */
export const getMonthlyAnalyticsService = async (user, requestedYear) => {
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

  // Parse the year, defaulting to the current year
  const year = requestedYear ? parseInt(requestedYear, 10) : new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) {
    throw new AppError("Invalid year parameter", 400);
  }

  // Execute all three queries concurrently
  const [appsRaw, jobsRaw, statusRaw] = await Promise.all([
    getMonthlyApplications(companyId, year),
    getMonthlyJobs(companyId, year),
    getCompanyApplicationStatistics(companyId),
  ]);

  return toMonthlyAnalytics(year, appsRaw, jobsRaw, statusRaw);
};
