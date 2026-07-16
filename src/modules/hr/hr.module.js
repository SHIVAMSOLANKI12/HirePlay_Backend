import hrRoutes from "./routes/hr.route.js";
import hrAuthModule from "./auth/auth.module.js";

export default function hrModule(app) {
  hrAuthModule(app);
  app.use("/api/v1/hr", hrRoutes);
}
