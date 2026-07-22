import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  analyzeInterviewWorkflow,
  getAIAnalysisWorkflow,
  getAISummaryWorkflow,
  getAIRisksWorkflow,
  getAIRecommendationsWorkflow
} from "../workflows/interviewAI.workflow.js";

export const analyzeInterview = asyncHandler(async (req, res) => {
  const analysis = await analyzeInterviewWorkflow(req.params.sessionId, req.body, req.user);
  successResponse(res, analysis, "AI Interview Intelligence Analysis generated successfully", 201);
});

export const getAIAnalysis = asyncHandler(async (req, res) => {
  const analysis = await getAIAnalysisWorkflow(req.params.sessionId, req.user);
  successResponse(res, analysis, "AI Interview Analysis retrieved successfully");
});

export const getAISummary = asyncHandler(async (req, res) => {
  const summary = await getAISummaryWorkflow(req.params.sessionId, req.user);
  successResponse(res, summary, "AI Candidate & Interview Summary retrieved successfully");
});

export const getAIRisks = asyncHandler(async (req, res) => {
  const risks = await getAIRisksWorkflow(req.params.sessionId, req.user);
  successResponse(res, risks, "AI Risk Analysis retrieved successfully");
});

export const getAIRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await getAIRecommendationsWorkflow(req.params.sessionId, req.user);
  successResponse(res, recommendations, "AI Hiring Recommendations retrieved successfully");
});
