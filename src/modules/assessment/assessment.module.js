import assessmentRoutes from "./routes/assessments.route.js";
import gameSessionRoutes from "./routes/gameSessions.route.js";

const assessmentModule = (app) => {
  app.use("/api/v1/assessments", assessmentRoutes);
  app.use("/api/v1/game-sessions", gameSessionRoutes);
};

export default assessmentModule;
