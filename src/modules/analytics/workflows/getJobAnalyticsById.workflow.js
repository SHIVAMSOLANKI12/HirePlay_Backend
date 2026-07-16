import AppError from "../../../utils/AppError.js";
import { getJobsAnalyticsData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, calculateJobMetrics } from "../services/analytics.service.js";
import { toJobAnalyticsDTO } from "../mappers/analytics.mapper.js";

export const getJobAnalyticsByIdWorkflow = async (user, filters, jobId) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  const jobs = await getJobsAnalyticsData(companyId, filters, jobId);
  
  if (!jobs || jobs.length === 0) {
    throw new AppError("Job not found or you do not have permission to view it.", 404);
  }

  const jobMetrics = calculateJobMetrics(jobs[0]);
  
  return toJobAnalyticsDTO(jobMetrics);
};
