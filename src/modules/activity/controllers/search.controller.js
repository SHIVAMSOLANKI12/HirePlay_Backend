import { searchActivitiesWorkflow } from "../workflows/searchActivities.workflow.js";
import { recordMetric } from "../services/metrics.service.js";

/**
 * @desc    Search and filter activity logs
 * @route   GET /api/v1/activities/search
 * @access  Private (HR, Company Admin)
 */
export const searchActivities = async (req, res, next) => {
  try {
    const { 
      q, 
      page, 
      limit, 
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
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      entityType,
      action,
      userId: performedBy,
      performedByRole,
      startDate,
      endDate
    };

    const start = Date.now();
    const results = await searchActivitiesWorkflow(req.user, filters);
    recordMetric("search_activities_latency_ms", Date.now() - start, { query: q, user: req.user.id });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
