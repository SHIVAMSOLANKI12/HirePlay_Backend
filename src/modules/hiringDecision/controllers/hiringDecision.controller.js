import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createHiringDecisionWorkflow,
  getHiringDecisionsWorkflow,
  getHiringDecisionByIdWorkflow,
  updateHiringDecisionWorkflow,
  reopenHiringDecisionWorkflow,
  addDecisionCommentWorkflow,
  getDecisionHistoryWorkflow
} from "../workflows/hiringDecision.workflow.js";
import {
  submitDecisionForReviewWorkflow,
  approveDecisionWorkflow,
  rejectDecisionWorkflow,
  escalateDecisionWorkflow
} from "../workflows/decisionApproval.workflow.js";

export const createHiringDecision = asyncHandler(async (req, res) => {
  const decision = await createHiringDecisionWorkflow(req.body, req.user);
  successResponse(res, decision, "Hiring decision created successfully", 201);
});

export const getHiringDecisions = asyncHandler(async (req, res) => {
  const { page, limit, status, applicationId, candidateId } = req.query;
  const result = await getHiringDecisionsWorkflow(
    { status, applicationId, candidateId },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Hiring decisions retrieved successfully");
});

export const getHiringDecisionById = asyncHandler(async (req, res) => {
  const decision = await getHiringDecisionByIdWorkflow(req.params.decisionId, req.user);
  successResponse(res, decision, "Hiring decision details retrieved successfully");
});

export const updateHiringDecision = asyncHandler(async (req, res) => {
  const decision = await updateHiringDecisionWorkflow(req.params.decisionId, req.body, req.user);
  successResponse(res, decision, "Hiring decision updated successfully");
});

export const submitDecision = asyncHandler(async (req, res) => {
  const decision = await submitDecisionForReviewWorkflow(req.params.decisionId, req.user);
  successResponse(res, decision, "Hiring decision submitted for review successfully");
});

export const approveDecision = asyncHandler(async (req, res) => {
  const decision = await approveDecisionWorkflow(req.params.decisionId, req.body, req.user);
  successResponse(res, decision, "Hiring decision level approved successfully");
});

export const rejectDecision = asyncHandler(async (req, res) => {
  const decision = await rejectDecisionWorkflow(req.params.decisionId, req.body, req.user);
  successResponse(res, decision, "Hiring decision rejected successfully");
});

export const escalateDecision = asyncHandler(async (req, res) => {
  const decision = await escalateDecisionWorkflow(req.params.decisionId, req.body, req.user);
  successResponse(res, decision, "Hiring decision escalated successfully");
});

export const reopenDecision = asyncHandler(async (req, res) => {
  const decision = await reopenHiringDecisionWorkflow(req.params.decisionId, req.user);
  successResponse(res, decision, "Hiring decision reopened successfully");
});

export const addDecisionComment = asyncHandler(async (req, res) => {
  const comment = await addDecisionCommentWorkflow(req.params.decisionId, req.body, req.user);
  successResponse(res, comment, "Decision comment added successfully", 201);
});

export const getDecisionHistory = asyncHandler(async (req, res) => {
  const history = await getDecisionHistoryWorkflow(req.params.decisionId, req.user);
  successResponse(res, history, "Decision history retrieved successfully");
});
