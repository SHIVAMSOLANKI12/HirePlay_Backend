/**
 * Enterprise RBAC Permission Engine
 */

export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

export const hasRole = (userRole, requiredRoles) => {
  if (!userRole) return false;
  if (!Array.isArray(requiredRoles)) return userRole === requiredRoles;
  return requiredRoles.includes(userRole);
};
