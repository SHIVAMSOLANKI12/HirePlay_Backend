import AppError from "../../../utils/AppError.js";
import { getRolePermissions } from "../services/authorization.service.js";
import { hasPermission, hasAnyPermission } from "../permissions/engine.js";

/**
 * Ensures the authenticated user has a specific permission.
 */
export const requirePermission = (requiredAction) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return next(new AppError("You are not authorized to access this resource.", 403));
      }

      // If user is SUPER_ADMIN, they can bypass permission checks
      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      const rolePermissions = await getRolePermissions(req.user.role);
      const userActions = rolePermissions.map(rp => rp.permission.action);

      if (!hasPermission(userActions, requiredAction)) {
        return next(new AppError(`Forbidden: Missing required permission [${requiredAction}]`, 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Ensures the authenticated user has at least one of the specified permissions.
 */
export const requireAnyPermission = (requiredActions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return next(new AppError("You are not authorized to access this resource.", 403));
      }

      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      const rolePermissions = await getRolePermissions(req.user.role);
      const userActions = rolePermissions.map(rp => rp.permission.action);

      if (!hasAnyPermission(userActions, requiredActions)) {
        return next(new AppError("Forbidden: Insufficient permissions.", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Ensures the user modifying a resource belongs to the same company as the resource.
 * @param {string} paramKey - The key in req.params, req.body, or req.query that holds the companyId. 
 *                            If omitted, it assumes the route expects the user's own company data.
 */
export const requireCompanyOwnership = (paramKey = "companyId") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    // SUPER_ADMIN can manage any company
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    const userCompanyId = req.user.companyId;
    if (!userCompanyId) {
      return next(new AppError("User is not associated with any company.", 403));
    }

    // Find target company ID in request
    const targetCompanyId = req.params[paramKey] || req.body[paramKey] || req.query[paramKey];

    if (targetCompanyId && targetCompanyId !== userCompanyId) {
      return next(new AppError("Forbidden: You cannot access resources outside your company.", 403));
    }

    next();
  };
};
