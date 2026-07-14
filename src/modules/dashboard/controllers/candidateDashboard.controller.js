import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getCandidateDashboardService } from "../services/candidateDashboard.service.js";
import { getCandidateRecentActivitiesService } from "../services/recentActivity.service.js";

export const getCandidateDashboardController = asyncHandler(async (req, res) => {
  // Business logic delegated to service
  const dashboardData = await getCandidateDashboardService(req.user);

  // Return standard success response
  return successResponse(
    res,
    dashboardData,
    "Candidate dashboard fetched successfully",
    200
  );
});

export const getCandidateRecentActivitiesController = asyncHandler(async (req, res) => {
  const activities = await getCandidateRecentActivitiesService(req.user);

  return successResponse(
    res,
    activities,
    "Recent activities fetched successfully",
    200
  );
});
