import express from "express";
import { scheduleInterview } from "../controllers/scheduleInterview.controller.js";
import { scheduleRound, getInterviewRounds, getApplicationInterviews } from "../controllers/multiRound.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { submitFeedback, updateFeedback, getInterviewFeedbacks } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  scheduleInterview
);

router.post(
  "/:interviewId/rounds",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  scheduleRound
);

router.get(
  "/:interviewId/rounds",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getInterviewRounds
);

// We attach the application sub-route here for simplicity, although it could be in application router
// The user explicitly requested GET /api/v1/applications/:applicationId/interviews, but since 
// the prefix of this router is `/api/v1/interviews`, I should handle this correctly.
// I will mount a router on the root app or just add it to application routes.

// Feedback Routes
router.post(
  "/:interviewId/feedback",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  submitFeedback
);

router.patch(
  "/:interviewId/feedback",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  updateFeedback
);

router.get(
  "/:interviewId/feedback",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getInterviewFeedbacks
);

export default router;
