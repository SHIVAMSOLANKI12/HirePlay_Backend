import interviewScorecardRoutes from "./routes/interviewScorecard.route.js";
import { getSessionEvaluations } from "./controllers/interviewScorecard.controller.js";
import { requireAuth } from "../../middleware/requireAuth.middleware.js";
import { requireRole } from "../../middleware/requireRole.middleware.js";

const interviewScorecardModule = (app) => {
  app.use("/api/v1/interview-scorecards", interviewScorecardRoutes);
  app.get(
    "/api/v1/interview-sessions/:sessionId/evaluations",
    requireAuth,
    requireRole("COMPANY_ADMIN", "HR", "INTERVIEWER"),
    getSessionEvaluations
  );
};

export default interviewScorecardModule;
