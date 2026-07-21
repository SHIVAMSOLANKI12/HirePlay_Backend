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
