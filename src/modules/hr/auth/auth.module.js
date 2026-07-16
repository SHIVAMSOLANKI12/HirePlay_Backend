import authRoutes from "./routes/auth.route.js";

export default function hrAuthModule(app) {
  app.use("/api/v1/hr/auth", authRoutes);
}
