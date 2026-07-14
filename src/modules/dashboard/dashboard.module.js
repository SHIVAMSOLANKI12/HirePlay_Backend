import dashboardRoutes from "./routes/dashboard.route.js";

const dashboardModule = (app) => {
  app.use("/api/v1/dashboard", dashboardRoutes);
};

export default dashboardModule;
