import jwt from "jsonwebtoken";
import { env } from "../../../../config/env.js";
import AppError from "../../../../utils/AppError.js";
import { generateHRAccessToken, generateHRRefreshToken, verifyRefreshToken } from "../../../../utils/jwt.js";
import { toRefreshTokenResponseDTO } from "../mappers/auth.mapper.js";
import { findHRByIdForAuth, updateRefreshToken } from "../repositories/auth.repository.js";
import { hashRefreshToken, validateHRForLogin, verifyStoredRefreshToken } from "../services/auth.service.js";

export const executeHRRefreshToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const { userId, tokenVersion } = decoded;
  
  const hr = await findHRByIdForAuth(userId);
  validateHRForLogin(hr);

  if (hr.tokenVersion !== tokenVersion) {
    throw new AppError("Refresh token revoked.", 401);
  }

  await verifyStoredRefreshToken(refreshToken, hr.refreshToken, hr.refreshTokenExpiresAt);

  const newAccessToken = generateHRAccessToken(hr);
  const newRefreshToken = generateHRRefreshToken(hr);
  
  const hashedRefreshToken = await hashRefreshToken(newRefreshToken);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
  
  await updateRefreshToken(hr.id, hashedRefreshToken, expiresAt);

  return toRefreshTokenResponseDTO(newAccessToken, newRefreshToken);
};
