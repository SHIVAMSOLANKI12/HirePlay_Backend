import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import {
  getMyResume,
  getResumeMetadata,
  previewResume,
  downloadResume,
  parseResume,
  getParsedResume,
  searchResumes,
  getResumeSearchSuggestions,
  scoreResume,
  getResumeScore
} from "../controllers/resumes.controller.js";

const router = Router();

// Secure all new resume routes
router.use(requireAuth);

// GET /api/v1/resumes/me - Alias to get Candidate's own active resume
router.get("/me", getMyResume);

// GET /api/v1/resumes/search/suggestions
router.get("/search/suggestions", getResumeSearchSuggestions);

// GET /api/v1/resumes/search
router.get("/search", searchResumes);

// GET /api/v1/resumes/:resumeId/metadata
router.get("/:resumeId/metadata", getResumeMetadata);

// GET /api/v1/resumes/:resumeId/download
router.get("/:resumeId/download", downloadResume);

// POST /api/v1/resumes/:resumeId/parse
router.post("/:resumeId/parse", parseResume);

// GET /api/v1/resumes/:resumeId/parsed
router.get("/:resumeId/parsed", getParsedResume);

// POST /api/v1/resumes/:resumeId/score
router.post("/:resumeId/score", scoreResume);

// GET /api/v1/resumes/:resumeId/score
router.get("/:resumeId/score", getResumeScore);

// GET /api/v1/resumes/:resumeId
router.get("/:resumeId", previewResume);

export default router;
