import assessmentRoutes from "./routes/assessments.route.js";

export default (app) => {
  app.use("/api/v1/assessments", assessmentRoutes);
};
