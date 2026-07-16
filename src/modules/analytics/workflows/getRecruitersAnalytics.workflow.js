import AppError from "../../../utils/AppError.js";
import { getRecruiterAnalyticsData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, bucketRecruiterData, calculateRecruiterMetrics } from "../services/analytics.service.js";
import { toRecruiterAnalyticsDTO } from "../mappers/analytics.mapper.js";

export const getRecruitersAnalyticsWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  const data = await getRecruiterAnalyticsData(companyId, filters);
  const bucketedData = bucketRecruiterData(data);
  const metrics = calculateRecruiterMetrics(bucketedData);
  
  return metrics.map(m => toRecruiterAnalyticsDTO(m));
};
