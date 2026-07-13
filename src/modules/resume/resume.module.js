import resumeRoutes from "./routes/resume.route.js";

export default function resumeModule(app) {
  // Assuming this is mounted alongside candidate module
  app.use("/api/v1/candidates/resume", resumeRoutes);
}
