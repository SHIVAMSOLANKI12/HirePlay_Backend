import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createOnboarding,
  getOnboardings,
  getOnboardingById,
  updateOnboarding,
  startOnboarding,
  completeOnboarding,
  createTaskTemplate,
  getTaskTemplates,
  createOnboardingTask,
  getOnboardingTasks,
  updateOnboardingTaskStatus
} from "../controllers/onboarding.controller.js";
import { documentUploadMiddleware, handleDocumentMulterError } from "../../document/middlewares/documentUpload.middleware.js";
import { uploadDocument, getDocumentsByOnboarding } from "../../document/controllers/employeeDocument.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/task-templates", requireRole("COMPANY_ADMIN", "HR"), createTaskTemplate);
router.get("/task-templates", requireRole("COMPANY_ADMIN", "HR"), getTaskTemplates);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createOnboarding);
router.get("/", requireRole("COMPANY_ADMIN", "HR"), getOnboardings);
router.get("/:id", requireRole("COMPANY_ADMIN", "HR"), getOnboardingById);
router.patch("/:id", requireRole("COMPANY_ADMIN", "HR"), updateOnboarding);

router.post("/:id/start", requireRole("COMPANY_ADMIN", "HR"), startOnboarding);
router.post("/:id/complete", requireRole("COMPANY_ADMIN", "HR"), completeOnboarding);

// Task Engine Routes
router.post("/:id/tasks", requireRole("COMPANY_ADMIN", "HR"), createOnboardingTask);
router.get("/:id/tasks", requireRole("COMPANY_ADMIN", "HR"), getOnboardingTasks);
router.patch("/:id/tasks/:taskId", requireRole("COMPANY_ADMIN", "HR"), updateOnboardingTaskStatus);

router.post("/:onboardingId/tasks", requireRole("COMPANY_ADMIN", "HR"), createOnboardingTask);
router.get("/:onboardingId/tasks", requireRole("COMPANY_ADMIN", "HR"), getOnboardingTasks);
router.patch("/:onboardingId/tasks/:taskId", requireRole("COMPANY_ADMIN", "HR"), updateOnboardingTaskStatus);

// Document Engine Routes for Onboarding
router.post(
  "/:onboardingId/documents",
  documentUploadMiddleware,
  handleDocumentMulterError,
  uploadDocument
);
router.get("/:onboardingId/documents", getDocumentsByOnboarding);

export default router;
