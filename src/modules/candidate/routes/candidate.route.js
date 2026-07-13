import { Router } from "express";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../middleware/requireRole.middleware.js";

import { registerCandidateController } from "../controllers/register.controller.js";
import { loginCandidateController } from "../controllers/login.controller.js";
import { getMeController, updateMeController } from "../controllers/profile.controller.js";

import { getMyApplicationsController } from "../../application/controllers/getMyApplications.controller.js";
import { getApplicationByIdController } from "../../application/controllers/getApplicationById.controller.js";
import { withdrawApplicationController } from "../../application/controllers/withdrawApplication.controller.js";

const router = Router();

// Public routes
router.post("/register", registerCandidateController);
router.post("/login", loginCandidateController);

// Protected candidate routes
router.get("/me", requireAuth, requireRole("CANDIDATE"), getMeController);
router.patch("/me", requireAuth, requireRole("CANDIDATE"), updateMeController);

// Applications
router.get("/applications", requireAuth, requireRole("CANDIDATE"), getMyApplicationsController);
router.get("/applications/:applicationId", requireAuth, requireRole("CANDIDATE"), getApplicationByIdController);
router.patch("/applications/:applicationId/withdraw", requireAuth, requireRole("CANDIDATE"), withdrawApplicationController);

export default router;
