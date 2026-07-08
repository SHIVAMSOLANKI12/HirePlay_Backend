import asyncHandler from "../../../middleware/async.middleware.js";
import { refreshService } from "../services/refresh.service.js";
import { successResponse } from "../../../utils/apiResponse.js";

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.hireplay_refresh_token;

  const result = await refreshService(refreshToken);

  return successResponse(
    res,
    result,
    "Access token refreshed successfully",
    200
  );
});