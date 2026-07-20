import AppError from "../../../utils/AppError.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
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

  eventEngine.emit(ACTIVITY_EVENTS.AUTH_LOGOUT, {
    userId: token.userId,
    performedByRole: "CANDIDATE",
    metadata: { source: "CANDIDATE_LOGOUT" }
  });

  return;
};