import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  analyzeInterview,
  getAIAnalysis,
  getAISummary,
  getAIRisks,
  getAIRecommendations
} from "../controllers/interviewAI.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/analyze/:sessionId", requireRole("COMPANY_ADMIN", "HR"), analyzeInterview);
router.get("/:sessionId", requireRole("COMPANY_ADMIN", "HR"), getAIAnalysis);
router.get("/:sessionId/summary", requireRole("COMPANY_ADMIN", "HR"), getAISummary);
router.get("/:sessionId/risks", requireRole("COMPANY_ADMIN", "HR"), getAIRisks);
router.get("/:sessionId/recommendations", requireRole("COMPANY_ADMIN", "HR"), getAIRecommendations);

export default router;
