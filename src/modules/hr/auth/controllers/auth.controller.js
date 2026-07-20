import asyncHandler from "../../../../middleware/async.middleware.js";
import { loginSchema, refreshTokenSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.validation.js";
import { executeHRLogin } from "../workflows/login.workflow.js";
import { executeGetHRMe } from "../workflows/me.workflow.js";
import { executeHRRefreshToken } from "../workflows/refreshToken.workflow.js";
import { executeHRLogout } from "../workflows/logout.workflow.js";
import { executeHRChangePassword } from "../workflows/changePassword.workflow.js";
import { executeHRForgotPassword } from "../workflows/forgotPassword.workflow.js";
import { executeHRResetPassword } from "../workflows/resetPassword.workflow.js";
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
  const result = await executeHRLogout(req.user.originalId, refreshToken);
  
  return successResponse(res, result, result.message, 200);
});

export const hrChangePasswordController = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const result = await executeHRChangePassword(req.user.originalId, currentPassword, newPassword);
  
  return successResponse(res, result, result.message, 200);
});

export const hrForgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await executeHRForgotPassword(email);
  
  return successResponse(res, result, result.message, 200);
});

export const hrResetPasswordController = asyncHandler(async (req, res) => {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);
  const result = await executeHRResetPassword(token, newPassword);
  
  return successResponse(res, result, result.message, 200);
});

export const hrMeController = asyncHandler(async (req, res) => {
  const result = await executeGetHRMe(req.user.originalId);

  return successResponse(res, result, "HR profile fetched successfully", 200);
});
