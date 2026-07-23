import express from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";
import {
  createVerification,
  getVerifications,
  getVerificationById,
  updateVerification,
  startVerification,
  verifyVerification,
  rejectVerification,
  requestInformation,
  getVerificationHistory
} from "../controllers/bgv.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole("COMPANY_ADMIN", "HR"), getVerifications);

// Standard verification routes supporting both :verificationId and :id
router.get("/:verificationId", requireRole("COMPANY_ADMIN", "HR"), getVerificationById);
router.patch("/:verificationId", requireRole("COMPANY_ADMIN", "HR"), updateVerification);

router.post("/:verificationId/start", requireRole("COMPANY_ADMIN", "HR"), startVerification);
router.post("/:verificationId/verify", requireRole("COMPANY_ADMIN", "HR"), verifyVerification);
router.post("/:verificationId/reject", requireRole("COMPANY_ADMIN", "HR"), rejectVerification);
router.post("/:verificationId/request-information", requireRole("COMPANY_ADMIN", "HR"), requestInformation);

router.get("/:verificationId/history", requireRole("COMPANY_ADMIN", "HR"), getVerificationHistory);

export default router;
