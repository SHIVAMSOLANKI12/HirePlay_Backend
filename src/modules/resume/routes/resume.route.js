import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { uploadResumeMiddleware, handleMulterError } from "../middlewares/upload.middleware.js";
import {
  uploadResumeController,
  getResumeController,
  replaceResumeController,
  deleteResumeController,
} from "../controllers/resume.controller.js";

const router = Router();

// Apply auth and role middleware to all resume routes
router.use(requireAuth, requireRole("CANDIDATE"));

// POST /api/v1/candidates/resume
router.post(
  "/",
  uploadResumeMiddleware.single("file"),
  handleMulterError,
  uploadResumeController
);

// GET /api/v1/candidates/resume
router.get("/", getResumeController);

// PATCH /api/v1/candidates/resume
router.patch(
  "/",
  uploadResumeMiddleware.single("file"),
  handleMulterError,
  replaceResumeController
);

// DELETE /api/v1/candidates/resume
router.delete("/", deleteResumeController);

export default router;
