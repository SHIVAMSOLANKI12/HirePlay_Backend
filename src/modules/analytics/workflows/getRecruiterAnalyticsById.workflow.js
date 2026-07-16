import AppError from "../../../utils/AppError.js";
import { getRecruiterAnalyticsData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, bucketRecruiterData, calculateRecruiterMetrics } from "../services/analytics.service.js";
import { toRecruiterAnalyticsDTO } from "../mappers/analytics.mapper.js";

export const getRecruiterAnalyticsByIdWorkflow = async (user, filters, recruiterId) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  const data = await getRecruiterAnalyticsData(companyId, filters, recruiterId);
  const bucketedData = bucketRecruiterData(data);
  const metrics = calculateRecruiterMetrics(bucketedData);
  
  if (!metrics || metrics.length === 0) {
    throw new AppError("Recruiter not found or you do not have permission to view their analytics.", 404);
  }

  return toRecruiterAnalyticsDTO(metrics[0]);
};
