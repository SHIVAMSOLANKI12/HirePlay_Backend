import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import {
  getJobStatistics,
  getCompanyApplicationStatistics,
  getRecentJobs,
  getRecentCompanyApplications,
} from "../repositories/dashboard.repository.js";
import { toRecruiterDashboard } from "../mappers/dashboard.mapper.js";

import { resolveCompanyId } from "../../shared/services/resolveCompanyId.service.js";

/**
 * Service to aggregate recruiter dashboard data
 */
export const getRecruiterDashboardService = async (user) => {
  const companyId = await resolveCompanyId(user);

  // Execute all four queries concurrently for maximum database throughput
  const [jobStats, appStats, recentJobs, recentApps] = await Promise.all([
    getJobStatistics(companyId),
    getCompanyApplicationStatistics(companyId),
    getRecentJobs(companyId),
    getRecentCompanyApplications(companyId),
  ]);

  return toRecruiterDashboard(jobStats, appStats, recentJobs, recentApps);
};
