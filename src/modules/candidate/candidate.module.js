import candidateRoutes from "./routes/candidate.route.js";

export default function candidateModule(app) {
  app.use("/api/v1/candidates", candidateRoutes);
}
