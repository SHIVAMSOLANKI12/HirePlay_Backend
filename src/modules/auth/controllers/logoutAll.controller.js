import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";

import { logoutAllService } from "../services/logoutAll.service.js";
import { clearRefreshCookie } from "../utils/authToken.util.js";

export const logoutAll = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.hireplay_refresh_token;

  await logoutAllService(refreshToken);

  clearRefreshCookie(res);

  return successResponse(
    res,
    null,
    "Logged out from all devices successfully",
    200
  );
});