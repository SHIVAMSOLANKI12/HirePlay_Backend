import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error.middleware.js";
import { registerRoutes, loginRoutes, refreshRoutes, logoutRoutes, logoutAllRoutes, meRoutes } from "./modules/auth/index.js";
import logger from "./config/logger.js";
import limiter from "./config/rateLimiter.js";
import corsMiddleware from "./config/cors.js";

const app = express();



app.use(corsMiddleware);
app.use(helmet());
app.use(logger);

app.use(express.json());
app.use(cookieParser());

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HirePlay Backend Running 🚀",
  });
});

// Routes
app.use("/api/v1/auth", registerRoutes);
app.use("/api/v1/auth", loginRoutes);
app.use("/api/v1/auth", refreshRoutes);
app.use("/api/v1/auth", logoutRoutes);
app.use("/api/v1/auth", logoutAllRoutes);
app.use("/api/v1/auth", meRoutes);

// Error handler should always be last
app.use(errorHandler);

export default app;