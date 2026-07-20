import { exportActivitiesWorkflow } from "../workflows/exportActivities.workflow.js";

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
    await exportActivitiesWorkflow(req.user, filters, res);
  } catch (error) {
    next(error);
  }
};
