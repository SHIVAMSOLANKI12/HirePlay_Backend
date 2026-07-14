import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getCandidateDashboardService } from "../services/candidateDashboard.service.js";

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
