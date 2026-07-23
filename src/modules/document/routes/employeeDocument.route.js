import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { documentUploadMiddleware, handleDocumentMulterError } from "../middlewares/documentUpload.middleware.js";
import {
  uploadDocument,
  getDocumentsByOnboarding,
  getDocumentById,
  updateDocument,
  deleteDocument,
  approveDocument,
  rejectDocument,
  reuploadDocument,
  requestReupload,
  getDocumentHistory,
  createDocumentTemplate,
  getDocumentTemplates
} from "../controllers/employeeDocument.controller.js";

const router = express.Router();

router.use(requireAuth);

// Document Templates
router.post("/templates", requireRole("COMPANY_ADMIN", "HR"), createDocumentTemplate);
router.get("/templates", requireRole("COMPANY_ADMIN", "HR"), getDocumentTemplates);

// Document Operations on Onboarding Records
router.post(
  "/onboarding/:onboardingId/documents",
  documentUploadMiddleware,
  handleDocumentMulterError,
  uploadDocument
);

router.get("/onboarding/:onboardingId/documents", getDocumentsByOnboarding);

// Individual Document Operations
router.get("/:documentId", getDocumentById);
router.patch("/:documentId", requireRole("COMPANY_ADMIN", "HR"), updateDocument);
router.delete("/:documentId", requireRole("COMPANY_ADMIN", "HR"), deleteDocument);

// Verification & Approval Lifecycle
router.post("/:documentId/approve", requireRole("COMPANY_ADMIN", "HR"), approveDocument);
router.post("/:documentId/reject", requireRole("COMPANY_ADMIN", "HR"), rejectDocument);
router.post("/:documentId/request-reupload", requireRole("COMPANY_ADMIN", "HR"), requestReupload);

router.post(
  "/:documentId/reupload",
  documentUploadMiddleware,
  handleDocumentMulterError,
  reuploadDocument
);

router.get("/:documentId/history", getDocumentHistory);

export default router;
