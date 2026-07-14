import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { getCandidateDashboardController } from "../controllers/candidateDashboard.controller.js";

const router = Router();

// Protected candidate routes
router.get(
  "/candidate",
  requireAuth,
  requireRole("CANDIDATE"),
  getCandidateDashboardController
);

export default router;
