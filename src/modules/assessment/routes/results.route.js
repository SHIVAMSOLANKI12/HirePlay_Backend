import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { getResultById } from "../controllers/assessments.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/:id", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getResultById);

export default router;
