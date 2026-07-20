import { Router } from "express";
import { getPreferences, updatePreferences } from "../controllers/preference.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";

const router = Router();

// All preference routes require authentication
router.use(requireAuth);

router.route("/")
  .get(getPreferences)
  .patch(updatePreferences);

export default router;
