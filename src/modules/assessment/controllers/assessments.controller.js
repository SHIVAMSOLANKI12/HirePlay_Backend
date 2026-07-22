import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { 
  createAssessmentWorkflow, 
  getAssessmentsWorkflow, 
  getAssessmentByIdWorkflow, 
  updateAssessmentWorkflow, 
  deleteAssessmentWorkflow 
} from "../workflows/assessment.workflow.js";
import { generatePuzzleWorkflow, getCandidatePuzzlesWorkflow } from "../workflows/puzzle.workflow.js";
import { 
  getAssessmentDashboardWorkflow, 
  getAssessmentLeaderboardWorkflow, 
  getAssessmentResultsWorkflow, 
  getResultByIdWorkflow 
} from "../workflows/dashboard.workflow.js";
import { getResultBehaviourWorkflow } from "../workflows/behaviour.workflow.js";
import { getAssessmentAnalyticsWorkflow, getAssessmentBehaviourSummaryWorkflow } from "../workflows/analytics.workflow.js";
import { PuzzleMapper } from "../mappers/puzzle.mapper.js";

export const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await createAssessmentWorkflow(req.body, req.user);
  successResponse(res, assessment, "Assessment created successfully", 201);
});

export const getAssessments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await getAssessmentsWorkflow(req.user, page, limit);
  successResponse(res, result, "Assessments fetched successfully");
});

export const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await getAssessmentByIdWorkflow(req.params.id, req.user);
  successResponse(res, assessment, "Assessment fetched successfully");
});

export const updateAssessment = asyncHandler(async (req, res) => {
  const assessment = await updateAssessmentWorkflow(req.params.id, req.body, req.user);
  successResponse(res, assessment, "Assessment updated successfully");
});

export const deleteAssessment = asyncHandler(async (req, res) => {
  await deleteAssessmentWorkflow(req.params.id, req.user);
  successResponse(res, null, "Assessment deleted successfully");
});

export const generateAssessmentPuzzles = asyncHandler(async (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) {
    return res.status(400).json({ success: false, message: "candidateId is required" });
  }

  const puzzles = await generatePuzzleWorkflow(req.params.id, candidateId, req.user);
  
  // Return admin-level DTO which includes hashes and versions, but NOT hiddenSolution
  const dto = puzzles.map(PuzzleMapper.toAdminDto);
  successResponse(res, dto, "Puzzles generated successfully", 201);
});

export const getCandidatePuzzles = asyncHandler(async (req, res) => {
  const puzzles = await getCandidatePuzzlesWorkflow(req.params.id, req.user);
  
  // Strip everything sensitive for the candidate view
  const dto = puzzles.map(PuzzleMapper.toCandidateDto);
  successResponse(res, dto, "Puzzles retrieved successfully");
});

export const getAssessmentDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getAssessmentDashboardWorkflow(req.params.id, req.user);
  successResponse(res, dashboard, "Dashboard retrieved successfully");
});

export const getAssessmentLeaderboard = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const leaderboard = await getAssessmentLeaderboardWorkflow(req.params.id, req.user, page, limit);
  successResponse(res, leaderboard, "Leaderboard retrieved successfully");
});

export const getAssessmentResults = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const results = await getAssessmentResultsWorkflow(req.params.id, req.user, page, limit);
  successResponse(res, results, "Results retrieved successfully");
});

export const getResultById = asyncHandler(async (req, res) => {
  const result = await getResultByIdWorkflow(req.params.id, req.user);
  successResponse(res, result, "Result retrieved successfully");
});

export const getResultBehaviour = asyncHandler(async (req, res) => {
  const behaviour = await getResultBehaviourWorkflow(req.params.id, req.user);
  successResponse(res, behaviour, "Behaviour profile retrieved successfully");
});

export const getAssessmentAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAssessmentAnalyticsWorkflow(req.params.id, req.user);
  successResponse(res, analytics, "Assessment analytics retrieved successfully");
});

export const getAssessmentBehaviourSummary = asyncHandler(async (req, res) => {
  const summary = await getAssessmentBehaviourSummaryWorkflow(req.params.id, req.user);
  successResponse(res, summary, "Behaviour summary retrieved successfully");
});

