import express from "express";
import { scheduleInterview } from "../controllers/scheduleInterview.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  scheduleInterview
);

export default router;
