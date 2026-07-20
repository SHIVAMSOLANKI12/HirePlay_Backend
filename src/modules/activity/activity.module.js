import activityLogRoutes from "./routes/activityLog.route.js";

export default (app) => {
  // Activity Log APIs
  app.use("/api/v1/activities", activityLogRoutes);
};
