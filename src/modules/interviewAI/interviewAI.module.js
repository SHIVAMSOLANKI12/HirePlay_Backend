import interviewAIRoutes from "./routes/interviewAI.route.js";

const interviewAIModule = (app) => {
  app.use("/api/v1/interview-ai", interviewAIRoutes);
};

export default interviewAIModule;
