import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { 
  updateApplicationStatusController,
  bulkUpdateApplicationStatusController
} from "../controllers/updateApplicationStatus.controller.js";
import { getRecruiterApplicationDetailsController } from "../controllers/getRecruiterApplicationDetails.controller.js";
import { getApplicationTimelineController } from "../controllers/getApplicationTimeline.controller.js";
import {
  createApplicationNoteController,
  getApplicationNotesController,
} from "../controllers/applicationNote.controller.js";

const router = Router();

// Protected recruiter routes

router.patch(
  "/bulk-status",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  bulkUpdateApplicationStatusController
);

router.get(
  "/:applicationId",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getRecruiterApplicationDetailsController
);

router.get(
  "/:applicationId/timeline",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getApplicationTimelineController
);

router.patch(
  "/:applicationId/status",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  updateApplicationStatusController
);

router.post(
  "/:applicationId/notes",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  createApplicationNoteController
);

router.get(
  "/:applicationId/notes",
  requireAuth,
  requireRole("COMPANY_ADMIN", "HR"),
  getApplicationNotesController
);

export default router;
