import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion
} from "../controllers/questionBank.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("COMPANY_ADMIN", "HR"), createQuestion);
router.get("/", requireRole("COMPANY_ADMIN", "HR"), getQuestions);
router.patch("/:questionId", requireRole("COMPANY_ADMIN", "HR"), updateQuestion);
router.delete("/:questionId", requireRole("COMPANY_ADMIN", "HR"), deleteQuestion);

export default router;
