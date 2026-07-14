import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import {
  getJobStatistics,
  getCompanyApplicationStatistics,
  getRecentJobs,
  getRecentCompanyApplications,
} from "../repositories/dashboard.repository.js";
import { toRecruiterDashboard } from "../mappers/dashboard.mapper.js";

/**
 * Service to aggregate recruiter dashboard data
 */
export const getRecruiterDashboardService = async (user) => {
  let companyId = user.companyId;

  // Resolve companyId for COMPANY_ADMIN if it's not present directly on user object
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found for the user", 404);
  }

  // Execute all four queries concurrently for maximum database throughput
  const [jobStats, appStats, recentJobs, recentApps] = await Promise.all([
    getJobStatistics(companyId),
    getCompanyApplicationStatistics(companyId),
    getRecentJobs(companyId),
    getRecentCompanyApplications(companyId),
  ]);

  return toRecruiterDashboard(jobStats, appStats, recentJobs, recentApps);
};
