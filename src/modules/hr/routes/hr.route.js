import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { createHRController } from "../controllers/createHR.controller.js";
import { getAllHRsController } from "../controllers/getAllHRs.controller.js";
import { getHRByIdController } from "../controllers/getHRById.controller.js";
import { updateHRController } from "../controllers/updateHR.controller.js";
import { softDeleteHRController } from "../controllers/softDeleteHR.controller.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";

const router = Router();

// Only authenticated company owner can create HR users.
router.post("/", requireAuth, requireRole("COMPANY_ADMIN"), createHRController);

// Get all HRs for the authenticated company.
router.get("/", requireAuth, requireRole("COMPANY_ADMIN"), getAllHRsController);

// Get HR by ID for the authenticated company.
router.get("/:id", requireAuth, requireRole("COMPANY_ADMIN"), getHRByIdController);

// Update HR for the authenticated company.
router.patch("/:id", requireAuth, requireRole("COMPANY_ADMIN"), updateHRController);

// Soft delete HR for the authenticated company.
router.delete("/:id", requireAuth, requireRole("COMPANY_ADMIN"), softDeleteHRController);

export default router;
