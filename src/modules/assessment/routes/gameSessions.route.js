import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  startSession,
  submitSession,
  pauseSession,
  resumeSession,
  submitMove,
  logCheatEvent,
  getSession
} from "../controllers/gameSessions.controller.js";

const router = express.Router();

router.use(requireAuth);

// All game session APIs are meant for Candidates playing the game
router.post("/:sessionId/start", requireRole("CANDIDATE"), startSession);
router.post("/:sessionId/submit", requireRole("CANDIDATE"), submitSession);
router.post("/:sessionId/pause", requireRole("CANDIDATE"), pauseSession);
router.post("/:sessionId/resume", requireRole("CANDIDATE"), resumeSession);
router.post("/:sessionId/move", requireRole("CANDIDATE"), submitMove);
router.post("/:sessionId/cheat-event", requireRole("CANDIDATE"), logCheatEvent);
router.get("/:sessionId", requireRole("CANDIDATE"), getSession);

export default router;
