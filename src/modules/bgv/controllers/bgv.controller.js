import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createVerificationWorkflow,
  getVerificationsWorkflow,
  getVerificationByIdWorkflow,
  updateVerificationWorkflow,
  startVerificationWorkflow,
  verifyVerificationWorkflow,
  rejectVerificationWorkflow,
  requestInformationWorkflow,
  getVerificationHistoryWorkflow
} from "../workflows/bgv.workflow.js";

export const createVerification = asyncHandler(async (req, res) => {
  const caseRecord = await createVerificationWorkflow(req.params.onboardingId, req.body, req.user);
  successResponse(res, caseRecord, "Background verification case initialized successfully", 201);
});

export const getVerifications = asyncHandler(async (req, res) => {
  const { page, limit, status, candidateId, assignedHrId } = req.query;
  const result = await getVerificationsWorkflow(
    { status, candidateId, assignedHrId },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Background verifications retrieved successfully");
});

export const getVerificationById = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const bgv = await getVerificationByIdWorkflow(verificationId, req.user);
  successResponse(res, bgv, "Background verification details retrieved successfully");
});

export const updateVerification = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const bgv = await updateVerificationWorkflow(verificationId, req.body, req.user);
  successResponse(res, bgv, "Background verification case updated successfully");
});

export const startVerification = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const bgv = await startVerificationWorkflow(verificationId, req.user);
  successResponse(res, bgv, "Background verification started successfully");
});

export const verifyVerification = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const bgv = await verifyVerificationWorkflow(verificationId, req.body, req.user);
  successResponse(res, bgv, "Background verification approved successfully");
});

export const rejectVerification = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const bgv = await rejectVerificationWorkflow(verificationId, req.body, req.user);
  successResponse(res, bgv, "Background verification rejected successfully");
});

export const requestInformation = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const bgv = await requestInformationWorkflow(verificationId, req.body, req.user);
  successResponse(res, bgv, "Additional information requested successfully");
});

export const getVerificationHistory = asyncHandler(async (req, res) => {
  const verificationId = req.params.verificationId || req.params.id;
  const history = await getVerificationHistoryWorkflow(verificationId, req.user);
  successResponse(res, history, "Background verification history retrieved successfully");
});
