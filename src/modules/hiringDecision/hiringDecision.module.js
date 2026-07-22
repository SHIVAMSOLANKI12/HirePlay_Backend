import hiringDecisionRoutes from "./routes/hiringDecision.route.js";

const hiringDecisionModule = (app) => {
  app.use("/api/v1/hiring-decisions", hiringDecisionRoutes);
};

export default hiringDecisionModule;
