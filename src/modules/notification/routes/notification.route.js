import { Router } from "express";
import { getNotifications, getNotificationById, markAsRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

router.route("/")
  .get(getNotifications);

router.route("/:notificationId")
  .get(getNotificationById);

router.route("/:notificationId/read")
  .patch(markAsRead);

export default router;
