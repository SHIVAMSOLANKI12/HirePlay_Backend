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
import dashboardModule from "./modules/dashboard/dashboard.module.js";
import interviewModule from "./modules/interview/interview.module.js";
import offerModule from "./modules/offer/offer.module.js";
import authorizationModule from "./modules/authorization/authorization.module.js";
import analyticsModule from "./modules/analytics/analytics.module.js";
import notificationModule from "./modules/notification/notification.module.js";
import activityModule from "./modules/activity/activity.module.js";
import assessmentModule from "./modules/assessment/assessment.module.js";
import interviewTemplateModule from "./modules/interviewTemplate/interviewTemplate.module.js";
import interviewSessionModule from "./modules/interviewSession/interviewSession.module.js";
import interviewScorecardModule from "./modules/interviewScorecard/interviewScorecard.module.js";
import interviewAIModule from "./modules/interviewAI/interviewAI.module.js";
import hiringDecisionModule from "./modules/hiringDecision/hiringDecision.module.js";
import onboardingModule from "./modules/onboarding/onboarding.module.js";
import documentModule from "./modules/document/document.module.js";
import bgvModule from "./modules/bgv/bgv.module.js";
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
dashboardModule(app);
interviewModule(app);
offerModule(app);
authorizationModule(app);
analyticsModule(app);
notificationModule(app);
activityModule(app);
assessmentModule(app);
interviewTemplateModule(app);
interviewSessionModule(app);
interviewScorecardModule(app);
interviewAIModule(app);
hiringDecisionModule(app);
onboardingModule(app);
documentModule(app);
bgvModule(app);
// Error handler should always be last
app.use(errorHandler);

export default app;