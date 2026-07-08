import AppError from "../../../utils/AppError.js";
import { verifyRefreshToken } from "../../../utils/jwt.js";

import {
  findRefreshToken,
  revokeAllRefreshTokens,
} from "../repositories/auth.repository.js";

export const logoutAllService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  // Verify JWT
  const payload = verifyRefreshToken(refreshToken);

  // Check token exists
  const tokenRecord = await findRefreshToken(refreshToken);

  if (!tokenRecord) {
    throw new AppError("Invalid refresh token", 401);
  }

  // Check revoked
  if (tokenRecord.isRevoked) {
    throw new AppError("Refresh token revoked", 401);
  }

  // Check expiry
  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  // Revoke all user's refresh tokens
  await revokeAllRefreshTokens(payload.id);

  return null;
};