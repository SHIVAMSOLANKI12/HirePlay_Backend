import { Router } from "express";
import { 
  hrLoginController, 
  hrMeController, 
  hrRefreshTokenController, 
  hrLogoutController,
  hrChangePasswordController,
  hrForgotPasswordController,
  hrResetPasswordController
} from "../controllers/auth.controller.js";
import { requireAuth } from "../../../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../../../middleware/requireRole.middleware.js";

const router = Router();

router.post("/login", hrLoginController);
router.post("/refresh-token", hrRefreshTokenController);
router.post("/logout", requireAuth, requireRole("HR"), hrLogoutController);
router.patch("/change-password", requireAuth, requireRole("HR"), hrChangePasswordController);
router.post("/forgot-password", hrForgotPasswordController);
router.post("/reset-password", hrResetPasswordController);
router.get("/me", requireAuth, requireRole("HR"), hrMeController);

export default router;
