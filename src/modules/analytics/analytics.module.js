import analyticsRoutes from "./routes/analytics.route.js";

export default (app) => {
  app.use("/api/v1/analytics", analyticsRoutes);
};
