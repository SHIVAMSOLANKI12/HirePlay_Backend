import AppError from "../../../utils/AppError.js";
import { getJobsAnalyticsData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, calculateJobMetrics, generateJobsDashboardSummary, generateJobRanking } from "../services/analytics.service.js";
import { toJobRankingDTO, toJobsDashboardSummaryDTO } from "../mappers/analytics.mapper.js";

export const getJobsRankingWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  const jobs = await getJobsAnalyticsData(companyId, filters);
  const jobsAnalytics = jobs.map(job => calculateJobMetrics(job));
  
  const ranking = generateJobRanking(jobsAnalytics);
  const summary = generateJobsDashboardSummary(jobsAnalytics);

  return {
    summary: toJobsDashboardSummaryDTO(summary),
    ranking: toJobRankingDTO(ranking)
  };
};
