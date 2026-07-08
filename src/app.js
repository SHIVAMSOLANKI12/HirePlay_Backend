import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import logger from "./config/logger.js";
import limiter from "./config/rateLimiter.js";
import corsMiddleware from "./config/cors.js";

const app = express();



app.use(corsMiddleware);
app.use(helmet());
app.use(logger);
app.use(express.json());
app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HirePlay Backend Running 🚀",
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);

// Error handler should always be last
app.use(errorHandler);

export default app;