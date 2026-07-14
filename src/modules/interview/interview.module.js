import interviewRoutes from "./routes/interview.route.js";

const interviewModule = (app) => {
  app.use("/api/v1/interviews", interviewRoutes);
};

export default interviewModule;
