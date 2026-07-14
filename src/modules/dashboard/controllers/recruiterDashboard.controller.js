import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getRecruiterDashboardService } from "../services/recruiterDashboard.service.js";

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
