export const toPermissionDTO = (permission) => {
  if (!permission) return null;
  return {
    id: permission.id,
    action: permission.action,
    description: permission.description,
  };
};

export const toRolePermissionDTO = (rolePermission) => {
  if (!rolePermission) return null;
  return {
    id: rolePermission.id,
    role: rolePermission.role,
    permission: toPermissionDTO(rolePermission.permission),
  };
};

export const toRolePermissionsListDTO = (rolePermissions) => {
  if (!Array.isArray(rolePermissions)) return [];
  return rolePermissions.map(toRolePermissionDTO);
};
