import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getActiveResumeService } from "../services/resume.service.js";
import { getResumeMetadataWorkflow, streamResumeWorkflow } from "../workflows/resume.workflow.js";

/**
 * Get own active resume (Candidate only)
 */
export const getMyResume = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;
  const resume = await getActiveResumeService(candidateId);

  return successResponse(
    res,
    resume,
    "Active resume fetched successfully",
    200
  );
});

/**
 * Get resume metadata
 */
export const getResumeMetadata = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const metadata = await getResumeMetadataWorkflow(req.user, resumeId);

  return successResponse(
    res,
    metadata,
    "Resume metadata fetched successfully",
    200
  );
});

/**
 * Preview resume (Stream inline)
 */
export const previewResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  await streamResumeWorkflow(req.user, resumeId, res, false);
});

/**
 * Download resume (Stream attachment)
 */
export const downloadResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  await streamResumeWorkflow(req.user, resumeId, res, true);
});
