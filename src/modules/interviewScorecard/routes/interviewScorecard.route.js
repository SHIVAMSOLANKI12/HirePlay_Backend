import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createScorecard,
  getScorecards,
  getScorecardById,
  updateScorecard,
  submitScorecard,
  reopenScorecard
} from "../controllers/interviewScorecard.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR", "INTERVIEWER"), createScorecard);
router.get("/", requireRole("COMPANY_ADMIN", "HR", "INTERVIEWER"), getScorecards);
router.get("/:scorecardId", requireRole("COMPANY_ADMIN", "HR", "INTERVIEWER"), getScorecardById);
router.patch("/:scorecardId", requireRole("COMPANY_ADMIN", "HR", "INTERVIEWER"), updateScorecard);
router.post("/:scorecardId/submit", requireRole("COMPANY_ADMIN", "HR", "INTERVIEWER"), submitScorecard);
router.post("/:scorecardId/reopen", requireRole("COMPANY_ADMIN"), reopenScorecard);

export default router;
