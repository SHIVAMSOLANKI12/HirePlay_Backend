import AppError from "../../../../utils/AppError.js";
import { verifyRefreshToken } from "../../../../utils/jwt.js";
import { clearRefreshToken } from "../repositories/auth.repository.js";

export const executeHRLogout = async (hrId, refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid refresh token.", 401);
  }

  if (decoded.userId !== hrId) {
    throw new AppError("Invalid refresh token for this user.", 401);
  }

  await clearRefreshToken(hrId);

  return { message: "Logged out successfully." };
};
