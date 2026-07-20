import { executeGetActivities, executeGetActivityById } from "../workflows/activityLog.workflow.js";
import { recordMetric } from "../services/metrics.service.js";

export const getActivities = async (req, res, next) => {
  try {
    // Both Company Owner and HR can view activities, depending on roles (assumed handled by middleware)
    const companyId = req.user.companyId || req.user.id; // Support both HR and Company Owner
    const filters = req.query;

    const start = Date.now();
    const activities = await executeGetActivities(companyId, filters);
    recordMetric("activity_fetch_latency_ms", Date.now() - start, { user: req.user.id });

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityById = async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.id;
    const activityId = req.params.id;

    const activity = await executeGetActivityById(companyId, activityId);

    res.status(200).json({
      success: true,
      message: "Activity fetched successfully",
      data: activity
    });
  } catch (error) {
    next(error);
  }
};
