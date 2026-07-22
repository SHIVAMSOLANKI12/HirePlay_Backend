import interviewTemplateRoutes from "./routes/interviewTemplate.route.js";
import questionBankRoutes from "./routes/questionBank.route.js";

const interviewTemplateModule = (app) => {
  app.use("/api/v1/interview-templates", interviewTemplateRoutes);
  app.use("/api/v1/question-bank", questionBankRoutes);
};

export default interviewTemplateModule;
