import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { logoutService } from "../services/logout.service.js";
import { clearRefreshCookie } from "../utils/authToken.util.js";

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.hireplay_refresh_token;

  await logoutService(refreshToken);

  clearRefreshCookie(res);

  return successResponse(
    res,
    null,
    "Logout successful",
    200
  );
});