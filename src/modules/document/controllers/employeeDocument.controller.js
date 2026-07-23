import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  uploadDocumentWorkflow,
  reuploadDocumentWorkflow,
  getDocumentsByOnboardingWorkflow,
  getDocumentByIdWorkflow,
  updateDocumentWorkflow,
  deleteDocumentWorkflow,
  getDocumentHistoryWorkflow
} from "../workflows/uploadDocument.workflow.js";
import {
  approveDocumentWorkflow,
  rejectDocumentWorkflow,
  requestReuploadWorkflow
} from "../workflows/verifyDocument.workflow.js";
import {
  createDocumentTemplateWorkflow,
  getDocumentTemplatesWorkflow
} from "../workflows/documentTemplate.workflow.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const doc = await uploadDocumentWorkflow(req.params.onboardingId, req.file || req.body.file, req.body, req.user);
  successResponse(res, doc, "Document uploaded successfully", 201);
});

export const getDocumentsByOnboarding = asyncHandler(async (req, res) => {
  const docs = await getDocumentsByOnboardingWorkflow(req.params.onboardingId, req.user);
  successResponse(res, docs, "Onboarding documents retrieved successfully");
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await getDocumentByIdWorkflow(req.params.documentId, req.user);
  successResponse(res, doc, "Document details retrieved successfully");
});

export const updateDocument = asyncHandler(async (req, res) => {
  const doc = await updateDocumentWorkflow(req.params.documentId, req.body, req.user);
  successResponse(res, doc, "Document metadata updated successfully");
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const result = await deleteDocumentWorkflow(req.params.documentId, req.user);
  successResponse(res, result, "Document deleted successfully");
});

export const approveDocument = asyncHandler(async (req, res) => {
  const doc = await approveDocumentWorkflow(req.params.documentId, req.body.remarks, req.user);
  successResponse(res, doc, "Document approved successfully");
});

export const rejectDocument = asyncHandler(async (req, res) => {
  const doc = await rejectDocumentWorkflow(req.params.documentId, req.body.reason || req.body.remarks, req.user);
  successResponse(res, doc, "Document rejected successfully");
});

export const reuploadDocument = asyncHandler(async (req, res) => {
  const doc = await reuploadDocumentWorkflow(req.params.documentId, req.file || req.body.file, req.body, req.user);
  successResponse(res, doc, "Replacement document uploaded successfully");
});

export const requestReupload = asyncHandler(async (req, res) => {
  const doc = await requestReuploadWorkflow(req.params.documentId, req.body.remarks, req.user);
  successResponse(res, doc, "Re-upload requested successfully");
});

export const getDocumentHistory = asyncHandler(async (req, res) => {
  const history = await getDocumentHistoryWorkflow(req.params.documentId, req.user);
  successResponse(res, history, "Document history retrieved successfully");
});

export const createDocumentTemplate = asyncHandler(async (req, res) => {
  const template = await createDocumentTemplateWorkflow(req.body, req.user);
  successResponse(res, template, "Document template created successfully", 201);
});

export const getDocumentTemplates = asyncHandler(async (req, res) => {
  const templates = await getDocumentTemplatesWorkflow(req.user);
  successResponse(res, templates, "Document templates retrieved successfully");
});
