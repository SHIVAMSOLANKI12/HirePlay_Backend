import bcrypt from "bcrypt";
import AppError from "../../../utils/AppError.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";

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
  const authUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  eventEngine.emit(ACTIVITY_EVENTS.AUTH_LOGIN, {
    userId: user.id,
    performedByRole: user.role,
    metadata: { source: "CANDIDATE_LOGIN" }
  });

  return {
    user: authUser,
    accessToken,
    refreshToken,
  };
};