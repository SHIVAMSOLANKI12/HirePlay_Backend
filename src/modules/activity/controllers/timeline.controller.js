import { getTimelineWorkflow } from "../workflows/getTimeline.workflow.js";
import { recordMetric } from "../services/metrics.service.js";

/**
 * @desc    Get activity timeline for a specific entity
 * @route   GET /api/v1/activities/timeline/:entityType/:entityId
 * @access  Private
 */
export const getTimeline = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Extract query filters and pagination
    const { page, limit, action, performedBy, startDate, endDate, sort } = req.query;
    
    const filters = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sort: sort || "desc",
      action,
      userId: performedBy, // Note: Timeline uses performedBy for filtering by user who did the action
      startDate,
      endDate
    };

    const start = Date.now();
    const timeline = await getTimelineWorkflow(req.user, entityType, entityId, filters);
    recordMetric("timeline_fetch_latency_ms", Date.now() - start, { entityType, entityId, user: req.user.id });

    res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};
