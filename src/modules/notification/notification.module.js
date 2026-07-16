import notificationRoutes from "./routes/notification.route.js";
import { registerNotificationSubscribers } from "./subscribers/notification.subscriber.js";

export default (app) => {
  // Register all event listeners
  registerNotificationSubscribers();

  // Mount notification routes
  app.use("/api/v1/notifications", notificationRoutes);
};
