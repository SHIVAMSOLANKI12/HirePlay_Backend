import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/index.js";
import {
  getHiringFunnel,
  getDashboardSummary,
  getTimeToHire,
  getHiringTrends
} from "../controllers/analytics.controller.js";

const router = Router();

// Protect all routes
router.use(requireAuth);
router.use(requireRole("COMPANY_ADMIN", "HR"));

// Routes
router.get("/hiring-funnel", getHiringFunnel);
router.get("/dashboard-summary", getDashboardSummary);
router.get("/time-to-hire", getTimeToHire);
router.get("/hiring-trends", getHiringTrends);

export default router;
