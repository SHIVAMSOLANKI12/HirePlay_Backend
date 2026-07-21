import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import { 
  createAssessment, 
  getAssessments, 
  getAssessmentById, 
  updateAssessment, 
  deleteAssessment 
} from "../controllers/assessments.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createAssessment);
router.get("/", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getAssessments);
router.get("/:id", requireRole("COMPANY_ADMIN", "HR", "CANDIDATE"), getAssessmentById);
router.patch("/:id", requireRole("COMPANY_ADMIN", "HR"), updateAssessment);
router.delete("/:id", requireRole("COMPANY_ADMIN", "HR"), deleteAssessment);

export default router;
