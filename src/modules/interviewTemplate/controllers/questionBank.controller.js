import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createQuestionWorkflow,
  getQuestionsWorkflow,
  updateQuestionWorkflow,
  deleteQuestionWorkflow
} from "../workflows/questionBank.workflow.js";

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await createQuestionWorkflow(req.body, req.user);
  successResponse(res, question, "Question created successfully in question bank", 201);
});

export const getQuestions = asyncHandler(async (req, res) => {
  const { page, limit, type, difficulty, categoryId, search } = req.query;
  const result = await getQuestionsWorkflow(
    { type, difficulty, categoryId, search },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Question bank retrieved successfully");
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await updateQuestionWorkflow(req.params.questionId, req.body, req.user);
  successResponse(res, question, "Question updated successfully");
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const result = await deleteQuestionWorkflow(req.params.questionId, req.user);
  successResponse(res, result, "Question soft deleted successfully");
});
