import { exportActivitiesWorkflow } from "../workflows/exportActivities.workflow.js";
import { recordMetric } from "../services/metrics.service.js";

/**
 * @desc    Export filtered activity logs as CSV
 * @route   GET /api/v1/activities/export
 * @access  Private (HR, Company Admin)
 */
export const exportActivities = async (req, res, next) => {
  try {
    const { 
      q, 
      sortBy, 
      sortOrder, 
      entityType, 
      action, 
      performedBy, 
      performedByRole, 
      startDate, 
      endDate 
    } = req.query;

    const filters = {
      q,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      entityType,
      action,
      userId: performedBy,
      performedByRole,
      startDate,
      endDate
    };

    // Workflow handles setting response headers and streaming CSV
    const start = Date.now();
    await exportActivitiesWorkflow(req.user, filters, res);
    recordMetric("export_activities_latency_ms", Date.now() - start, { user: req.user.id });
  } catch (error) {
    next(error);
  }
};
