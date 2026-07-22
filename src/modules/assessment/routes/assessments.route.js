import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { 
  createAssessment, 
  getAssessments, 
  getAssessmentById, 
  updateAssessment, 
  deleteAssessment,
  generateAssessmentPuzzles,
  getCandidatePuzzles,
  getAssessmentDashboard, 
  getAssessmentLeaderboard, 
  getAssessmentResults,
  getAssessmentAnalytics,
  getAssessmentBehaviourSummary
} from "../controllers/assessments.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createAssessment);
router.get("/", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getAssessments);
router.get("/:id", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getAssessmentById);
router.patch("/:id", requireRole("COMPANY_ADMIN", "HR"), updateAssessment);
router.delete("/:id", requireRole("COMPANY_ADMIN", "HR"), deleteAssessment);

// Puzzle Generation Endpoints
router.post("/:id/generate", requireRole("COMPANY_ADMIN", "HR"), generateAssessmentPuzzles);
router.get("/:id/puzzle", requireRole("CANDIDATE"), getCandidatePuzzles);

// Dashboard & Analytics Endpoints (HR/ADMIN)
router.get("/:id/dashboard", requireRole("COMPANY_ADMIN", "HR"), getAssessmentDashboard);
router.get("/:id/leaderboard", requireRole("COMPANY_ADMIN", "HR"), getAssessmentLeaderboard);
router.get("/:id/results", requireRole("COMPANY_ADMIN", "HR"), getAssessmentResults);
router.get("/:id/analytics", requireRole("COMPANY_ADMIN", "HR"), getAssessmentAnalytics);
router.get("/:id/behaviour-summary", requireRole("COMPANY_ADMIN", "HR"), getAssessmentBehaviourSummary);

export default router;
