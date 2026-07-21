import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getActiveResumeService } from "../services/resume.service.js";
import { getResumeMetadataWorkflow, streamResumeWorkflow } from "../workflows/resume.workflow.js";
import { parseResumeWorkflow, getParsedResumeWorkflow } from "../workflows/resume-parsing.workflow.js";

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

/**
 * Parse resume (extract text and structure)
 */
export const parseResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const { force } = req.query; // force=true to re-parse
  
  const result = await parseResumeWorkflow(req.user, resumeId, force === "true");

  return successResponse(
    res,
    {
      id: result.id,
      parsingStatus: result.parsingStatus,
      parsedAt: result.parsedAt,
      parserVersion: result.parserVersion
    },
    "Resume parsing completed",
    200
  );
});

/**
 * Get extracted parsed data
 */
export const getParsedResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  
  const parsedData = await getParsedResumeWorkflow(req.user, resumeId);

  return successResponse(
    res,
    parsedData,
    "Parsed resume data fetched successfully",
    200
  );
});
