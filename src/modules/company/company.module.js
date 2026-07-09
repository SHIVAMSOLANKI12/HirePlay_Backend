import companyRoutes from "./routes/company.route.js";

export default function companyModule(app) {
  app.use("/api/v1/company", companyRoutes);
}