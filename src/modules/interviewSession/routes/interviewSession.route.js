import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createInterviewSession,
  getInterviewSessions,
  getInterviewSessionById,
  updateInterviewSession,
  startInterviewSession,
  pauseInterviewSession,
  resumeInterviewSession,
  completeInterviewSession,
  cancelInterviewSession,
  addInterviewNote,
  getInterviewNotes,
  getSessionTimeline
} from "../controllers/interviewSession.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createInterviewSession);
router.get("/", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getInterviewSessions);
router.get("/:sessionId", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getInterviewSessionById);
router.patch("/:sessionId", requireRole("COMPANY_ADMIN", "HR"), updateInterviewSession);

router.post("/:sessionId/start", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), startInterviewSession);
router.post("/:sessionId/pause", requireRole("COMPANY_ADMIN", "HR"), pauseInterviewSession);
router.post("/:sessionId/resume", requireRole("COMPANY_ADMIN", "HR"), resumeInterviewSession);
router.post("/:sessionId/complete", requireRole("COMPANY_ADMIN", "HR"), completeInterviewSession);
router.post("/:sessionId/cancel", requireRole("COMPANY_ADMIN", "HR"), cancelInterviewSession);

router.post("/:sessionId/notes", requireRole("COMPANY_ADMIN", "HR"), addInterviewNote);
router.get("/:sessionId/notes", requireRole("COMPANY_ADMIN", "HR"), getInterviewNotes);
router.get("/:sessionId/timeline", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getSessionTimeline);

export default router;
