import AppError from "../../../utils/AppError.js";
import { getJobsAnalyticsData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, calculateJobMetrics } from "../services/analytics.service.js";
import { toJobAnalyticsDTO } from "../mappers/analytics.mapper.js";

export const getJobsAnalyticsWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  const jobs = await getJobsAnalyticsData(companyId, filters);

  const jobMetrics = jobs.map(job => calculateJobMetrics(job));
  
  return jobMetrics.map(metrics => toJobAnalyticsDTO(metrics));
};
