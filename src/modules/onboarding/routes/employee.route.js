import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  getEmployees,
  getEmployeeById
} from "../controllers/onboarding.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole("COMPANY_ADMIN", "HR"), getEmployees);
router.get("/:employeeId", requireRole("COMPANY_ADMIN", "HR"), getEmployeeById);

export default router;
