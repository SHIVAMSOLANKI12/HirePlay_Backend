import AppError from "../../../utils/AppError.js";
import { getRecruiterAnalyticsData } from "../repositories/analytics.repository.js";
import { 
  getCompanyIdForUser, 
  bucketRecruiterData, 
  calculateRecruiterMetrics, 
  generateRecruiterRanking, 
  generateRecruiterDashboardSummary 
} from "../services/analytics.service.js";
import { toRecruiterRankingDTO, toRecruiterSummaryDTO } from "../mappers/analytics.mapper.js";

export const getRecruitersRankingWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  const data = await getRecruiterAnalyticsData(companyId, filters);
  const bucketedData = bucketRecruiterData(data);
  const metrics = calculateRecruiterMetrics(bucketedData);
  
  const ranking = generateRecruiterRanking(metrics);
  const summary = generateRecruiterDashboardSummary(metrics);

  return {
    summary: toRecruiterSummaryDTO(summary),
    ranking: toRecruiterRankingDTO(ranking)
  };
};
