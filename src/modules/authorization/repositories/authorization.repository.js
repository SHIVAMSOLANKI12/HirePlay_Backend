import prisma from "../../../config/prisma.js";

export const findPermissions = async () => {
  return prisma.permission.findMany({
    select: {
      id: true,
      action: true,
      description: true,
    }
  });
};

export const findRolePermissions = async (role) => {
  return prisma.rolePermission.findMany({
    where: { role },
    select: {
      id: true,
      role: true,
      permission: {
        select: {
          id: true,
          action: true,
          description: true,
        }
      }
    }
  });
};

export const findPermissionByAction = async (action) => {
  return prisma.permission.findUnique({
    where: { action },
    select: {
      id: true,
      action: true,
    }
  });
};

export const assignPermission = async (role, permissionId) => {
  return prisma.rolePermission.create({
    data: {
      role,
      permissionId
    },
    select: {
      id: true,
      role: true,
      permission: {
        select: {
          id: true,
          action: true,
        }
      }
    }
  });
};

export const removePermission = async (role, permissionId) => {
  return prisma.rolePermission.delete({
    where: {
      role_permissionId: {
        role,
        permissionId
      }
    }
  });
};

export const upsertPermission = async (action, description) => {
  return prisma.permission.upsert({
    where: { action },
    update: { description },
    create: { action, description }
  });
};
