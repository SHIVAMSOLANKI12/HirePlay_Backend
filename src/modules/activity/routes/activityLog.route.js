import { Router } from "express";
import { getActivities, getActivityById } from "../controllers/activityLog.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";

const router = Router();

// Protect all activity routes
router.use(requireAuth);

router.route("/")
  .get(getActivities);

router.route("/:id")
  .get(getActivityById);

export default router;
