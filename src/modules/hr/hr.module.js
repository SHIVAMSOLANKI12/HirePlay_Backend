import hrRoutes from "./routes/hr.route.js";

export default function hrModule(app) {
  app.use("/api/v1/hr", hrRoutes);
}
