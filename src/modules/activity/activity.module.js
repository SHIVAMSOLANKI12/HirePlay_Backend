import activityLogRoutes from "./routes/activityLog.route.js";
import { initializeActivityLogger } from "./services/activityLogger.service.js";

export default (app) => {
  // Initialize the activity logger to listen to events
  initializeActivityLogger();
  
  // Activity Log APIs
  app.use("/api/v1/activities", activityLogRoutes);
};
