import AppError from "../../../../utils/AppError.js";
import { verifyRefreshToken } from "../../../../utils/jwt.js";
import { eventEngine } from "../../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../../activity/constants/activity.events.js";
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

  eventEngine.emit(ACTIVITY_EVENTS.AUTH_LOGOUT, {
    userId: hrId,
    performedByRole: "HR", // or whatever the role is
    metadata: { source: "HR_LOGOUT" }
  });

  return { message: "Logged out successfully." };
};
