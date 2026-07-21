import AppError from "../../../../utils/AppError.js";
import { generateHRAccessToken, generateHRRefreshToken } from "../../../../utils/jwt.js";
import { eventEngine } from "../../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../../activity/constants/activity.events.js";
import { env } from "../../../../config/env.js";
import { toLoginResponseDTO } from "../mappers/auth.mapper.js";
import { updateLastLogin, updateRefreshToken } from "../repositories/auth.repository.js";
import { getHRForLogin, validateHRForLogin, verifyPassword, hashRefreshToken } from "../services/auth.service.js";

export const executeHRLogin = async (email, password) => {
  const hr = await getHRForLogin(email);
  validateHRForLogin(hr);

  const isPasswordValid = await verifyPassword(password, hr.password);
  
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  await updateLastLogin(hr.id);
  
  const accessToken = generateHRAccessToken(hr);
  const refreshToken = generateHRRefreshToken(hr);
  
  const hashedRefreshToken = await hashRefreshToken(refreshToken);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
  
  await updateRefreshToken(hr.id, hashedRefreshToken, expiresAt);

  eventEngine.emit(ACTIVITY_EVENTS.AUTH_LOGIN, {
    companyId: hr.companyId,
    performedByRole: hr.role,
    metadata: { source: "HR_LOGIN", hrId: hr.id }
  });

  return toLoginResponseDTO(hr, accessToken, refreshToken);
};
