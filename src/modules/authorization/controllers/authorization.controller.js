import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { 
  getPermissions, 
  getRolePermissions, 
  grantPermissionToRole, 
  revokePermissionFromRole,
  syncDefaultPermissions
} from "../services/authorization.service.js";
import { toPermissionDTO, toRolePermissionsListDTO } from "../mappers/authorization.mapper.js";

export const listPermissionsController = asyncHandler(async (req, res) => {
  const permissions = await getPermissions();
  const dto = permissions.map(toPermissionDTO);
  return successResponse(res, dto, "Permissions retrieved successfully.", 200);
});

export const listRolePermissionsController = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const rolePermissions = await getRolePermissions(role);
  const dto = toRolePermissionsListDTO(rolePermissions);
  return successResponse(res, dto, `Permissions for role ${role} retrieved successfully.`, 200);
});

export const assignPermissionController = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { permissionId } = req.body;
  const result = await grantPermissionToRole(role, permissionId);
  return successResponse(res, result, "Permission assigned successfully.", 201);
});

export const removePermissionController = asyncHandler(async (req, res) => {
  const { role, permissionId } = req.params;
  await revokePermissionFromRole(role, permissionId);
  return successResponse(res, null, "Permission removed successfully.", 200);
});

export const syncPermissionsController = asyncHandler(async (req, res) => {
  const result = await syncDefaultPermissions();
  return successResponse(res, result, "Default permissions synced successfully.", 200);
});
