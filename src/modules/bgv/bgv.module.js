import bgvRoutes from "./routes/bgv.route.js";

const bgvModule = (app) => {
  app.use("/api/v1/background-verifications", bgvRoutes);
};

export default bgvModule;
