import registerRoutes from "./routes/register.routes.js";
import loginRoutes from "./routes/login.route.js";
import refreshRoutes from "./routes/refresh.route.js";
import logoutRoutes from "./routes/logout.route.js";
import logoutAllRoutes from "./routes/logoutAll.route.js";
import meRoutes from "./routes/me.route.js";

export default function authModule(app) {
  app.use("/api/v1/auth", registerRoutes);
  app.use("/api/v1/auth", loginRoutes);
  app.use("/api/v1/auth", refreshRoutes);
  app.use("/api/v1/auth", logoutRoutes);
  app.use("/api/v1/auth", logoutAllRoutes);
  app.use("/api/v1/auth", meRoutes);
}