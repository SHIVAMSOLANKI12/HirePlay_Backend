import bcrypt from "bcrypt";
import AppError from "../../../utils/AppError.js";

import {
  findUserByEmail,
  createRefreshToken,
} from "../repositories/auth.repository.js";

import {
  createAccessToken,
  createRefreshJwt,
  getRefreshTokenExpiry,
} from "../utils/authToken.util.js";

export const loginService = async (data) => {
  // Find user
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate Tokens
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshJwt(user);

  // Save Refresh Token
  await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: getRefreshTokenExpiry(),
  });

  // Never send password
  const { password, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};