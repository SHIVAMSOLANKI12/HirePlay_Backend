import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  updateApplicationNoteController,
  deleteApplicationNoteController,
} from "../controllers/applicationNote.controller.js";

const router = Router();

// Protected recruiter routes for specific notes
router.patch(
  "/:noteId",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  updateApplicationNoteController
);

router.delete(
  "/:noteId",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  deleteApplicationNoteController
);

export default router;
