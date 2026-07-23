import documentRoutes from "./routes/employeeDocument.route.js";

const documentModule = (app) => {
  app.use("/api/v1/documents", documentRoutes);
};

export default documentModule;
