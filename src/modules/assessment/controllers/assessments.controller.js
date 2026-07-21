import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { 
  createAssessmentWorkflow, 
  getAssessmentsWorkflow, 
  getAssessmentByIdWorkflow, 
  updateAssessmentWorkflow, 
  deleteAssessmentWorkflow 
} from "../workflows/assessment.workflow.js";

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
