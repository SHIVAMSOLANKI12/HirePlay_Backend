import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createInterviewTemplate,
  getInterviewTemplates,
  getInterviewTemplateById,
  updateInterviewTemplate,
  deleteInterviewTemplate,
  duplicateInterviewTemplate
} from "../controllers/interviewTemplate.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createInterviewTemplate);
router.get("/", requireRole("COMPANY_ADMIN", "HR"), getInterviewTemplates);
router.get("/:templateId", requireRole("COMPANY_ADMIN", "HR"), getInterviewTemplateById);
router.patch("/:templateId", requireRole("COMPANY_ADMIN", "HR"), updateInterviewTemplate);
router.delete("/:templateId", requireRole("COMPANY_ADMIN", "HR"), deleteInterviewTemplate);
router.post("/:templateId/duplicate", requireRole("COMPANY_ADMIN", "HR"), duplicateInterviewTemplate);

export default router;
