import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import asyncHandler from "./async.middleware.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.ownerId || decoded.id, // Magical fix to ensure FK constraints always get the Company Owner ID
      originalId: decoded.id, // For HR specific routes to fetch their own profiles
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId, // Added for HR tokens
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Not authorized, token expired", 401);
    }
    throw new AppError("Not authorized, token failed", 401);
  }
});
