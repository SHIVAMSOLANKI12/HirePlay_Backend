import AppError from "../../../utils/AppError.js";
import { getApplicationsWithSourceData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, bucketSourceData, calculateSourceMetrics } from "../services/analytics.service.js";
import { toSourceAnalyticsDTO } from "../mappers/analytics.mapper.js";

export const getSourceAnalyticsWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  // Fetch Raw Data with relationships
  const applications = await getApplicationsWithSourceData(companyId, filters);

  // Bucket and Calculate
  const bucketedData = bucketSourceData(applications);
  const sourceMetrics = calculateSourceMetrics(bucketedData);

  return toSourceAnalyticsDTO(sourceMetrics);
};
