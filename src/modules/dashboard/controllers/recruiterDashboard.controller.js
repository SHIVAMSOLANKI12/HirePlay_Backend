import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getRecruiterDashboardService } from "../services/recruiterDashboard.service.js";
import { getHiringFunnelService } from "../services/hiringFunnel.service.js";
import { getMonthlyAnalyticsService } from "../services/monthlyAnalytics.service.js";

export const getRecruiterDashboardController = asyncHandler(async (req, res) => {
  // Business logic delegated to service
  const dashboardData = await getRecruiterDashboardService(req.user);

  // Return standard success response
  return successResponse(
    res,
    dashboardData,
    "Recruiter dashboard fetched successfully",
    200
  );
});

export const getHiringFunnelController = asyncHandler(async (req, res) => {
  const funnelData = await getHiringFunnelService(req.user);

  return successResponse(
    res,
    funnelData,
    "Hiring funnel fetched successfully",
    200
  );
});

export const getMonthlyAnalyticsController = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const analyticsData = await getMonthlyAnalyticsService(req.user, year);

  return successResponse(
    res,
    analyticsData,
    "Monthly analytics fetched successfully",
    200
  );
});
