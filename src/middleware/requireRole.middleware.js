import AppError from "../utils/AppError.js";

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("Not authorized, role information missing", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role: ${req.user.role} is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};
