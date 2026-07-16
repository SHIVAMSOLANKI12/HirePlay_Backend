import AppError from "../../../utils/AppError.js";
import { getHiredApplicationsData, getStageTransitionData } from "../repositories/analytics.repository.js";
import { 
  getCompanyIdForUser, 
  calculateTimeToHireMetrics, 
  calculateStageDurations, 
  analyzeBottlenecks 
} from "../services/analytics.service.js";
import { toTimeToHireDTO } from "../mappers/analytics.mapper.js";

export const getTimeToHireWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  if (!companyId) {
    throw new AppError("No associated company found for this user.", 403);
  }

  // Fetch Raw Data
  const [hiredApps, stageTransitions] = await Promise.all([
    getHiredApplicationsData(companyId, filters),
    getStageTransitionData(companyId, filters)
  ]);

  // Calculations
  const timeToHireMetrics = calculateTimeToHireMetrics(hiredApps);
  const stageDurations = calculateStageDurations(stageTransitions);
  const bottlenecks = analyzeBottlenecks(stageDurations);

  return toTimeToHireDTO(timeToHireMetrics, stageDurations, bottlenecks);
};
