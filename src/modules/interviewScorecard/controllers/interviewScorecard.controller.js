import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createScorecardWorkflow,
  getScorecardsWorkflow,
  getScorecardByIdWorkflow,
  updateScorecardWorkflow,
  submitScorecardWorkflow,
  reopenScorecardWorkflow
} from "../workflows/interviewScorecard.workflow.js";
import { getSessionEvaluationsWorkflow } from "../workflows/evaluationSummary.workflow.js";

export const createScorecard = asyncHandler(async (req, res) => {
  const scorecard = await createScorecardWorkflow(req.body, req.user);
  successResponse(res, scorecard, "Interview scorecard created in DRAFT mode", 201);
});

export const getScorecards = asyncHandler(async (req, res) => {
  const { page, limit, status, sessionId, interviewerId } = req.query;
  const result = await getScorecardsWorkflow(
    { status, sessionId, interviewerId },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Interview scorecards retrieved successfully");
});

export const getScorecardById = asyncHandler(async (req, res) => {
  const scorecard = await getScorecardByIdWorkflow(req.params.scorecardId, req.user);
  successResponse(res, scorecard, "Interview scorecard details retrieved successfully");
});

export const updateScorecard = asyncHandler(async (req, res) => {
  const scorecard = await updateScorecardWorkflow(req.params.scorecardId, req.body, req.user);
  successResponse(res, scorecard, "Interview scorecard updated successfully");
});

export const submitScorecard = asyncHandler(async (req, res) => {
  const scorecard = await submitScorecardWorkflow(req.params.scorecardId, req.body, req.user);
  successResponse(res, scorecard, "Interview scorecard submitted and locked successfully");
});

export const reopenScorecard = asyncHandler(async (req, res) => {
  const scorecard = await reopenScorecardWorkflow(req.params.scorecardId, req.user);
  successResponse(res, scorecard, "Interview scorecard reopened to DRAFT mode successfully");
});

export const getSessionEvaluations = asyncHandler(async (req, res) => {
  const result = await getSessionEvaluationsWorkflow(req.params.sessionId, req.user);
  successResponse(res, result, "Session evaluations and aggregated scores retrieved successfully");
});
