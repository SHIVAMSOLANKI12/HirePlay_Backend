import interviewSessionRoutes from "./routes/interviewSession.route.js";

const interviewSessionModule = (app) => {
  app.use("/api/v1/interview-sessions", interviewSessionRoutes);
};

export default interviewSessionModule;
