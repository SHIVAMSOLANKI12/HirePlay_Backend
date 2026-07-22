import assessmentRoutes from "./routes/assessments.route.js";
import gameSessionRoutes from "./routes/gameSessions.route.js";
import resultsRoutes from "./routes/results.route.js";

const assessmentModule = (app) => {
  app.use("/api/v1/assessments", assessmentRoutes);
  app.use("/api/v1/game-sessions", gameSessionRoutes);
  app.use("/api/v1/results", resultsRoutes);
};

export default assessmentModule;
