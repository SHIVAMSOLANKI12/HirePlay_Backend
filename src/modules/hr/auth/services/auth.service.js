import bcrypt from "bcrypt";
import AppError from "../../../../utils/AppError.js";
import { findHRByEmailForAuth } from "../repositories/auth.repository.js";

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const validateHRForLogin = (hr) => {
  if (!hr) {
    throw new AppError("Invalid email or password.", 401);
  }
  
  if (hr.deletedAt) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (hr.status !== "ACTIVE" || !hr.isActive) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (hr.company && hr.company.deletedAt) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (hr.role !== "HR") {
    throw new AppError("Invalid email or password.", 401);
  }
};

export const getHRForLogin = async (email) => {
  const hr = await findHRByEmailForAuth(email);
  return hr;
};

export const hashRefreshToken = async (token) => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  return bcrypt.hash(token, saltRounds);
};

export const verifyStoredRefreshToken = async (plainToken, hashedToken, expiresAt) => {
  if (!hashedToken || !expiresAt) {
    throw new AppError("Invalid refresh token.", 401);
  }

  if (new Date() > new Date(expiresAt)) {
    throw new AppError("Refresh token expired.", 401);
  }

  const isValid = await bcrypt.compare(plainToken, hashedToken);
  if (!isValid) {
    throw new AppError("Invalid refresh token.", 401);
  }

  return true;
};

export const hashPassword = async (password) => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  return bcrypt.hash(password, saltRounds);
};

export const validatePasswordStrength = (password) => {
  if (password.length < 8 || password.length > 64) {
    throw new AppError("Password must be between 8 and 64 characters.", 400);
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new AppError("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.", 400);
  }
};
