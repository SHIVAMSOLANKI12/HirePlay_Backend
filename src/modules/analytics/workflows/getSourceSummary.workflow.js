import AppError from "../../../utils/AppError.js";
import { getApplicationsWithSourceData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, bucketSourceData, calculateSourceMetrics, generateSourceSummary } from "../services/analytics.service.js";
import { toSourceSummaryDTO } from "../mappers/analytics.mapper.js";

export const getSourceSummaryWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  // Fetch Raw Data
  const applications = await getApplicationsWithSourceData(companyId, filters);

  // Bucket and Calculate
  const bucketedData = bucketSourceData(applications);
  const sourceMetrics = calculateSourceMetrics(bucketedData);
  
  // Generate Summary
  const summary = generateSourceSummary(sourceMetrics);

  return toSourceSummaryDTO(summary);
};
