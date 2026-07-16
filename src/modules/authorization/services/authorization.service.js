import AppError from "../../../utils/AppError.js";
import { 
  findPermissions, 
  findRolePermissions, 
  assignPermission, 
  removePermission, 
  findPermissionByAction,
  upsertPermission
} from "../repositories/authorization.repository.js";
import { DEFAULT_PERMISSIONS } from "../constants/permissions.constant.js";

const VALID_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR", "CANDIDATE"];

export const getPermissions = async () => {
  return findPermissions();
};

export const getRolePermissions = async (role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError("Invalid role specified.", 400);
  }
  return findRolePermissions(role);
};

export const grantPermissionToRole = async (role, permissionId) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError("Invalid role specified.", 400);
  }

  try {
    return await assignPermission(role, permissionId);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError("Permission is already assigned to this role.", 400);
    }
    throw error;
  }
};

export const revokePermissionFromRole = async (role, permissionId) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError("Invalid role specified.", 400);
  }

  try {
    await removePermission(role, permissionId);
    return { success: true };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError("Permission assignment not found.", 404);
    }
    throw error;
  }
};

export const syncDefaultPermissions = async () => {
  const results = [];
  for (const action of DEFAULT_PERMISSIONS) {
    const perm = await upsertPermission(action, `System permission for ${action}`);
    results.push(perm);
  }
  return results;
};
