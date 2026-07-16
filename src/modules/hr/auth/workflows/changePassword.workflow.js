import AppError from "../../../../utils/AppError.js";
import { findHRByIdForAuth, updatePassword } from "../repositories/auth.repository.js";
import { hashPassword, validatePasswordStrength, verifyPassword } from "../services/auth.service.js";

export const executeHRChangePassword = async (hrId, currentPassword, newPassword) => {
  const hr = await findHRByIdForAuth(hrId);
  if (!hr || !hr.isActive || hr.status !== "ACTIVE") {
    throw new AppError("Account is inactive or not found.", 401);
  }

  // We need the full HR object to get the password for verification,
  // but findHRByIdForAuth doesn't select password. Let's use Prisma directly 
  // or a custom repo function. Since auth.service already has a function 
  // to get HR by email with password, let's just fetch it by email.
  // Actually, we can just import findHRByEmailForAuth since we have email.
  const { findHRByEmailForAuth } = await import("../repositories/auth.repository.js");
  const hrWithPassword = await findHRByEmailForAuth(hr.email);

  const isPasswordValid = await verifyPassword(currentPassword, hrWithPassword.password);
  if (!isPasswordValid) {
    throw new AppError("Incorrect current password.", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError("New password must be different from current password.", 400);
  }

  validatePasswordStrength(newPassword);

  const hashedNewPassword = await hashPassword(newPassword);

  await updatePassword(hrId, hashedNewPassword);

  return { message: "Password changed successfully. All active sessions have been logged out." };
};
