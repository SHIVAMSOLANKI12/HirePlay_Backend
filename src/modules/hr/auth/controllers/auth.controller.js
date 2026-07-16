import asyncHandler from "../../../../middleware/async.middleware.js";
import { loginSchema, refreshTokenSchema } from "../validations/auth.validation.js";
import { executeHRLogin } from "../workflows/login.workflow.js";
import { executeGetHRMe } from "../workflows/me.workflow.js";
import { executeHRRefreshToken } from "../workflows/refreshToken.workflow.js";
import { executeHRLogout } from "../workflows/logout.workflow.js";
import { successResponse } from "../../../../utils/apiResponse.js";

export const hrLoginController = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await executeHRLogin(email, password);

  return successResponse(res, result, "Login successful", 200);
});

export const hrRefreshTokenController = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const result = await executeHRRefreshToken(refreshToken);
  
  return successResponse(res, result, "Token refreshed successfully", 200);
});

export const hrLogoutController = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const result = await executeHRLogout(req.user.id, refreshToken);
  
  return successResponse(res, result, result.message, 200);
});

export const hrMeController = asyncHandler(async (req, res) => {
  const result = await executeGetHRMe(req.user.id);

  return successResponse(res, result, "HR profile fetched successfully", 200);
});
