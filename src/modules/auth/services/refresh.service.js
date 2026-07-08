import AppError from "../../../utils/AppError.js";
import { verifyRefreshToken } from "../../../utils/jwt.js";
import { createAccessToken } from "../utils/authToken.util.js";

import {
  findRefreshToken,
} from "../repositories/auth.repository.js";

import {
  findUserById,
} from "../repositories/user.repository.js";

export const refreshService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  // Verify JWT
  const payload = verifyRefreshToken(refreshToken);

  // Check token exists in DB
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

  // Find user
  const user = await findUserById(payload.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Generate new access token
  const accessToken = createAccessToken(user);

  return {
    accessToken,
    user,
  };
};