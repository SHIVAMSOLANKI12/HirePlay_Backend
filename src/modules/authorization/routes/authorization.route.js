import { Router } from "express";
import { 
  listPermissionsController, 
  listRolePermissionsController, 
  assignPermissionController, 
  removePermissionController,
  syncPermissionsController
} from "../controllers/authorization.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";

const router = Router();

// In a real application, these should be protected by SUPER_ADMIN role.
// For testing/development, we allow COMPANY_ADMIN and HR to view them, but only SUPER_ADMIN can modify.
router.use(requireAuth);

router.get("/permissions", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "HR"), listPermissionsController);
router.get("/roles/:role/permissions", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "HR"), listRolePermissionsController);

// Only SUPER_ADMIN can manage permissions
router.post("/roles/:role/permissions", requireRole("SUPER_ADMIN"), assignPermissionController);
router.delete("/roles/:role/permissions/:permissionId", requireRole("SUPER_ADMIN"), removePermissionController);

// Sync permissions (Developer tool)
router.post("/sync", requireRole("SUPER_ADMIN"), syncPermissionsController);

export default router;
