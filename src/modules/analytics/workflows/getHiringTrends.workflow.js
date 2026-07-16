import AppError from "../../../utils/AppError.js";
import { getHiredApplicationsData } from "../repositories/analytics.repository.js";
import { getCompanyIdForUser, calculateHiringTrends } from "../services/analytics.service.js";
import { toHiringTrendDTO } from "../mappers/analytics.mapper.js";

export const getHiringTrendsWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  // Fetch Raw Hired Apps
  const hiredApps = await getHiredApplicationsData(companyId, filters);

  // Calculate Trends
  const trends = calculateHiringTrends(hiredApps);

  return toHiringTrendDTO(trends);
};
