import AppError from "../utils/AppError.js";

/**
 * Middleware to restrict access based on user roles.
 * @param {...string} allowedRoles - List of roles that are allowed to access the route.
 * @returns {Function} Express middleware function
 */
export const requireRole = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user?.role) {
      return next(new AppError("You are not authorized to access this resource.", 403));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You are not authorized to access this resource.", 403));
    }

    next();
  };
};
