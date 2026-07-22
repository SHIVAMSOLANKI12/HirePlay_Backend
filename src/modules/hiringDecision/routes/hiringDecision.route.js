import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createHiringDecision,
  getHiringDecisions,
  getHiringDecisionById,
  updateHiringDecision,
  submitDecision,
  approveDecision,
  rejectDecision,
  escalateDecision,
  reopenDecision,
  addDecisionComment,
  getDecisionHistory
} from "../controllers/hiringDecision.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createHiringDecision);
router.get("/", requireRole("COMPANY_ADMIN", "HR"), getHiringDecisions);
router.get("/:decisionId", requireRole("COMPANY_ADMIN", "HR"), getHiringDecisionById);
router.patch("/:decisionId", requireRole("COMPANY_ADMIN", "HR"), updateHiringDecision);

router.post("/:decisionId/submit", requireRole("COMPANY_ADMIN", "HR"), submitDecision);
router.post("/:decisionId/approve", requireRole("COMPANY_ADMIN", "HR"), approveDecision);
router.post("/:decisionId/reject", requireRole("COMPANY_ADMIN", "HR"), rejectDecision);
router.post("/:decisionId/escalate", requireRole("COMPANY_ADMIN", "HR"), escalateDecision);
router.post("/:decisionId/reopen", requireRole("COMPANY_ADMIN"), reopenDecision);

router.post("/:decisionId/comments", requireRole("COMPANY_ADMIN", "HR"), addDecisionComment);
router.get("/:decisionId/history", requireRole("COMPANY_ADMIN", "HR"), getDecisionHistory);

export default router;
