import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { getCandidateDashboardController } from "../controllers/candidateDashboard.controller.js";
import { getRecruiterDashboardController, getHiringFunnelController, getMonthlyAnalyticsController } from "../controllers/recruiterDashboard.controller.js";

const router = Router();

// Protected candidate routes
router.get(
  "/candidate",
  requireAuth,
  requireRole("CANDIDATE"),
  getCandidateDashboardController
);

// Protected recruiter routes
router.get(
  "/recruiter",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getRecruiterDashboardController
);

router.get(
  "/recruiter/hiring-funnel",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getHiringFunnelController
);

router.get(
  "/recruiter/monthly-analytics",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getMonthlyAnalyticsController
);

export default router;
