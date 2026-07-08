import { env } from "../../../config/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt.js";

export const createAccessToken = (user) => {
  return generateAccessToken(user);
};

export const createRefreshJwt = (user) => {
  return generateRefreshToken(user);
};

export const getRefreshTokenExpiry = () => {
  return new Date(
    Date.now() +
      env.REFRESH_TOKEN_EXPIRES_DAYS *
        24 *
        60 *
        60 *
        1000
  );
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("hireplay_refresh_token", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:
      env.REFRESH_TOKEN_EXPIRES_DAYS *
      24 *
      60 *
      60 *
      1000,
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie("hireplay_refresh_token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });
};