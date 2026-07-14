import express from "express";
import { getApplicationInterviews } from "../controllers/multiRound.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";

const router = express.Router();

router.get(
  "/:applicationId/interviews",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getApplicationInterviews
);

export default router;
