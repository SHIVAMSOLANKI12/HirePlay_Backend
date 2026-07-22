import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { getResultById, getResultBehaviour } from "../controllers/assessments.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/:id", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getResultById);
router.get("/:id/behaviour", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getResultBehaviour);

export default router;
