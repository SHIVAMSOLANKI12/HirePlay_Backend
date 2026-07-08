import asyncHandler from "../../../middleware/async.middleware.js";
import { loginSchema } from "../validations/login.validation.js";
import { loginService } from "../services/login.service.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { setRefreshCookie } from "../utils/authToken.util.js";

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const result = await loginService(body);

  setRefreshCookie(res, result.refreshToken);

  return successResponse(
    res,
    {
      user: result.user,
      accessToken: result.accessToken,
    },
    "Login successful",
    200
  );
});