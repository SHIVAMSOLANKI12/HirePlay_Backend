import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createInterviewTemplateWorkflow,
  getInterviewTemplatesWorkflow,
  getInterviewTemplateByIdWorkflow,
  updateInterviewTemplateWorkflow,
  deleteInterviewTemplateWorkflow,
  duplicateInterviewTemplateWorkflow
} from "../workflows/interviewTemplate.workflow.js";

export const createInterviewTemplate = asyncHandler(async (req, res) => {
  const template = await createInterviewTemplateWorkflow(req.body, req.user);
  successResponse(res, template, "Interview template created successfully", 201);
});

export const getInterviewTemplates = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;
  const result = await getInterviewTemplatesWorkflow(
    { status, search },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Interview templates retrieved successfully");
});

export const getInterviewTemplateById = asyncHandler(async (req, res) => {
  const template = await getInterviewTemplateByIdWorkflow(req.params.templateId, req.user);
  successResponse(res, template, "Interview template details retrieved successfully");
});

export const updateInterviewTemplate = asyncHandler(async (req, res) => {
  const template = await updateInterviewTemplateWorkflow(req.params.templateId, req.body, req.user);
  successResponse(res, template, "Interview template updated successfully");
});

export const deleteInterviewTemplate = asyncHandler(async (req, res) => {
  const result = await deleteInterviewTemplateWorkflow(req.params.templateId, req.user);
  successResponse(res, result, "Interview template soft deleted successfully");
});

export const duplicateInterviewTemplate = asyncHandler(async (req, res) => {
  const template = await duplicateInterviewTemplateWorkflow(req.params.templateId, req.user);
  successResponse(res, template, "Interview template duplicated successfully", 201);
});
