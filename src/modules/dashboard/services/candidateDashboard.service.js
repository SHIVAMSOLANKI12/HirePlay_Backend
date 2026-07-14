import { getApplicationCounts, getRecentApplications } from "../repositories/dashboard.repository.js";
import { toCandidateDashboard } from "../mappers/dashboard.mapper.js";

/**
 * Service to aggregate candidate dashboard data
 */
export const getCandidateDashboardService = async (user) => {
  const candidateId = user.id;

  // Execute queries concurrently for maximum database throughput
  const [statusCounts, recentApplications] = await Promise.all([
    getApplicationCounts(candidateId),
    getRecentApplications(candidateId),
  ]);

  return toCandidateDashboard(statusCounts, recentApplications);
};
