import { Router } from "express";
import { hrLoginController, hrMeController, hrRefreshTokenController, hrLogoutController } from "../controllers/auth.controller.js";
import { requireAuth } from "../../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../../middleware/requireRole.middleware.js";

const router = Router();

router.post("/login", hrLoginController);
router.post("/refresh-token", hrRefreshTokenController);
router.post("/logout", requireAuth, requireRole("HR"), hrLogoutController);
router.get("/me", requireAuth, requireRole("HR"), hrMeController);

export default router;
