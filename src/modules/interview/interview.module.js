import interviewRoutes from "./routes/interview.route.js";
import applicationInterviewRoutes from "./routes/applicationInterview.route.js";

const interviewModule = (app) => {
  app.use("/api/v1/interviews", interviewRoutes);
  app.use("/api/v1/applications", applicationInterviewRoutes);
};

export default interviewModule;
