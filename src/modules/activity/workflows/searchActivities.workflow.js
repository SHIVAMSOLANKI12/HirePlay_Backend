import AppError from "../../../utils/AppError.js";
import { searchActivityLogs } from "../repositories/activityLog.repository.js";

/**
 * Workflow to search and filter activity logs.
 * Enforces company isolation.
 */
export const searchActivitiesWorkflow = async (user, filters) => {
  if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "HR")) {
    throw new AppError("Access denied", 403);
  }

  const companyId = user.companyId || user.id;

  const results = await searchActivityLogs(companyId, filters);

  return results;
};
