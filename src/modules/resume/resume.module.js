import resumeRoutes from "./routes/resume.route.js";
import resumesRoutes from "./routes/resumes.route.js";

export default function resumeModule(app) {
  // Existing candidate-specific routes (Upload, Replace, Delete)
  app.use("/api/v1/candidates/resume", resumeRoutes);
  
  // New cross-role secure Resume serving routes (Preview, Download, Metadata)
  app.use("/api/v1/resumes", resumesRoutes);
}
