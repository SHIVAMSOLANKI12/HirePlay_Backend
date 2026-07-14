import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { createJobController } from "../controllers/createJob.controller.js";
import { getAllJobsController } from "../controllers/getAllJobs.controller.js";
import { getJobByIdController } from "../controllers/getJobById.controller.js";
import { updateJobController } from "../controllers/updateJob.controller.js";
import { softDeleteJobController } from "../controllers/softDeleteJob.controller.js";
import { publishJobController, unpublishJobController, closeJobController, reopenJobController } from "../controllers/jobActions.controller.js";
import { applyToJobController } from "../../application/controllers/applyToJob.controller.js";
import { getApplicantsController, exportApplicantsController } from "../../application/controllers/getApplicants.controller.js";

const router = Router();

// Create Job API
router.post("/", requireAuth, requireRole("COMPANY_ADMIN", "HR"), createJobController);

// Get All Jobs API
router.get("/", requireAuth, requireRole("COMPANY_ADMIN", "HR"), getAllJobsController);

// Get Job By ID API
router.get("/:id", requireAuth, requireRole("COMPANY_ADMIN", "HR"), getJobByIdController);

// Update Job API
router.patch("/:id", requireAuth, requireRole("COMPANY_ADMIN", "HR"), updateJobController);

// Soft Delete Job API
router.delete("/:id", requireAuth, requireRole("COMPANY_ADMIN", "HR"), softDeleteJobController);

// Job Business Actions
router.patch("/:id/publish", requireAuth, requireRole("COMPANY_ADMIN", "HR"), publishJobController);
router.patch("/:id/unpublish", requireAuth, requireRole("COMPANY_ADMIN", "HR"), unpublishJobController);
router.patch("/:id/close", requireAuth, requireRole("COMPANY_ADMIN", "HR"), closeJobController);
router.patch("/:id/reopen", requireAuth, requireRole("COMPANY_ADMIN", "HR"), reopenJobController);

// Candidate Actions
router.post("/:jobId/apply", requireAuth, requireRole("CANDIDATE"), applyToJobController);

// Employer Actions
router.get("/:jobId/applicants/export", requireAuth, requireRole("COMPANY_ADMIN", "HR"), exportApplicantsController);
router.get("/:jobId/applications", requireAuth, requireRole("COMPANY_ADMIN", "HR"), getApplicantsController);

export default router;
