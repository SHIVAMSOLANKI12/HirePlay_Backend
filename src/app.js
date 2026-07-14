import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";

import { errorHandler } from "./middleware/error.middleware.js";
import authModule from "./modules/auth/auth.module.js";
import companyModule from "./modules/company/company.module.js";
import hrModule from "./modules/hr/hr.module.js";
import jobModule from "./modules/job/job.module.js";
import candidateModule from "./modules/candidate/candidate.module.js";
import resumeModule from "./modules/resume/resume.module.js";
import applicationModule from "./modules/application/application.module.js";
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

// Serve static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HirePlay Backend Running 🚀",
  });
});

// Routes
authModule(app);
companyModule(app);
hrModule(app);
jobModule(app);
candidateModule(app);
resumeModule(app);
applicationModule(app);

// Error handler should always be last
app.use(errorHandler);

export default app;