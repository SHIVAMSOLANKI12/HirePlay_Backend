import AppError from "../../../utils/AppError.js";
import {
  findRefreshToken,
  revokeRefreshToken,
} from "../repositories/auth.repository.js";

export const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  const token = await findRefreshToken(refreshToken);

  if (!token || token.isRevoked) {
    throw new AppError("Invalid refresh token", 401);
  }

  await revokeRefreshToken(refreshToken);

  return;
};