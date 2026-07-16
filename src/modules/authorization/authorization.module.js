import authorizationRoutes from "./routes/authorization.route.js";

const authorizationModule = (app) => {
  app.use("/api/v1/authorization", authorizationRoutes);
};

export default authorizationModule;
