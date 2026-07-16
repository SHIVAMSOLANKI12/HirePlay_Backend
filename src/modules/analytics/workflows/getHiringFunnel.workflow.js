import AppError from "../../../utils/AppError.js";
import { getFunnelCounts } from "../repositories/analytics.repository.js";
import { calculateFunnelMetrics, getCompanyIdForUser } from "../services/analytics.service.js";
import { toHiringFunnelDTO } from "../mappers/analytics.mapper.js";

export const getHiringFunnelWorkflow = async (user, filters) => {
  // Extract company context from User or HR
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  // Fetch Raw Counts
  const rawCounts = await getFunnelCounts(companyId, filters);

  // Apply Business Calculation (Conversion Percentages)
  const metrics = calculateFunnelMetrics(rawCounts);

  // Return mapped DTO
  return toHiringFunnelDTO(metrics);
};
