import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { changeJobStatusService } from "../services/jobActions.service.js";

export const publishJobController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedJob = await changeJobStatusService(req.user, id, "PUBLISHED");
  return successResponse(res, updatedJob, "Job published successfully.", 200);
});

export const unpublishJobController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedJob = await changeJobStatusService(req.user, id, "DRAFT");
  return successResponse(res, updatedJob, "Job unpublished successfully.", 200);
});

export const closeJobController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedJob = await changeJobStatusService(req.user, id, "CLOSED");
  return successResponse(res, updatedJob, "Job closed successfully.", 200);
});

export const reopenJobController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedJob = await changeJobStatusService(req.user, id, "PUBLISHED");
  return successResponse(res, updatedJob, "Job reopened successfully.", 200);
});
