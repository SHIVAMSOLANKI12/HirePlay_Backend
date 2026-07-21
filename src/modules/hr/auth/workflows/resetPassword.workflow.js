import crypto from "crypto";
import AppError from "../../../../utils/AppError.js";
import { eventEngine } from "../../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../../activity/constants/activity.events.js";
import { findByResetToken, updatePassword, clearResetToken } from "../repositories/auth.repository.js";
import { hashPassword, validatePasswordStrength } from "../services/auth.service.js";

export const executeHRResetPassword = async (plainToken, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");
  
  const hr = await findByResetToken(hashedToken);
  if (!hr) {
    throw new AppError("Invalid or expired password reset token.", 400);
  }

  validatePasswordStrength(newPassword);

  const hashedNewPassword = await hashPassword(newPassword);

  // updatePassword already handles password update, invalidating refresh tokens, and incrementing tokenVersion
  await updatePassword(hr.id, hashedNewPassword);

  // We should also clear the reset token specifically
  await clearResetToken(hr.id);

  eventEngine.emit(ACTIVITY_EVENTS.AUTH_PASSWORD_RESET, {
    companyId: hr.companyId,
    performedByRole: hr.role,
    metadata: { source: "HR_PASSWORD_RESET", hrId: hr.id }
  });

  return { message: "Password has been reset successfully. You can now login." };
};
