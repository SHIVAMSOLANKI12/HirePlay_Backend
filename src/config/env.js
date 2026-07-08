import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 8000,

  DATABASE_URL: process.env.DATABASE_URL,

  NODE_ENV: process.env.NODE_ENV || "development",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  ACCESS_TOKEN_EXPIRES_IN:
    process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",

  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",

  REFRESH_TOKEN_EXPIRES_DAYS:
    Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7,

  REFRESH_COOKIE_MAX_AGE:
  Number(process.env.REFRESH_COOKIE_MAX_AGE) || 604800000,

  // Bcrypt
  BCRYPT_SALT_ROUNDS:
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};