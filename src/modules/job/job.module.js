import jobRoutes from "./routes/job.route.js";

export default function jobModule(app) {
  app.use("/api/v1/jobs", jobRoutes);
}
