import AppError from "../../../utils/AppError.js";
import { getExportActivityLogs } from "../repositories/activityLog.repository.js";
import { streamCsv } from "../services/csvExporter.service.js";

/**
 * Workflow to export activity logs to CSV.
 * Enforces company isolation.
 */
export const exportActivitiesWorkflow = async (user, filters, res) => {
  if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "HR")) {
    throw new AppError("Access denied", 403);
  }

  const companyId = user.companyId || user.id;

  // Set response headers for CSV download
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=activity_logs_${new Date().getTime()}.csv`);

  // Stream data directly from DB to CSV (using cursor-ready unpaginated retrieval)
  // For safety, we fetch using skip/take chunks in the repo or just fetch all filtered if reasonable.
  // We'll use a generator or chunked approach in repo if necessary.
  
  const activities = await getExportActivityLogs(companyId, filters);

  await streamCsv(activities, res);
};
