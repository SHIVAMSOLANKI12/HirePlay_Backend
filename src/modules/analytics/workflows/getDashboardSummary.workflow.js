import AppError from "../../../utils/AppError.js";
import { getDashboardCounts } from "../repositories/analytics.repository.js";
import { calculateDashboardMetrics, getCompanyIdForUser } from "../services/analytics.service.js";
import { toDashboardSummaryDTO } from "../mappers/analytics.mapper.js";

export const getDashboardSummaryWorkflow = async (user, filters) => {
  // Extract company context from User or HR
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  // Fetch Raw Counts
  const rawCounts = await getDashboardCounts(companyId, filters);

  // Apply Business Calculation (Placeholder for Time to Hire)
  const metrics = calculateDashboardMetrics(rawCounts);

  // Return mapped DTO
  return toDashboardSummaryDTO(metrics);
};
