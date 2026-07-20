import notificationRoutes from "./routes/notification.route.js";
import preferenceRoutes from "./routes/preference.route.js";
import { registerNotificationSubscribers } from "./subscribers/notification.subscriber.js";
import "./queue/queue.worker.js"; // Initialize and start queue worker

export default (app) => {
  // Register all event listeners
  registerNotificationSubscribers();

  // Mount notification routes
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/notification-preferences", preferenceRoutes);
};
