import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getActiveResumeService } from "../services/resume.service.js";
import { getResumeMetadataWorkflow, streamResumeWorkflow, searchResumesWorkflow, getResumeSearchSuggestionsWorkflow, scoreResumeWorkflow, getResumeScoreWorkflow } from "../workflows/resume.workflow.js";
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
  
  const data = await getParsedResumeWorkflow(req.user, resumeId);

  return successResponse(
    res,
    data,
    "Parsed resume fetched successfully",
    200
  );
});

/**
 * Search resumes (Recruiters only)
 */
export const searchResumes = asyncHandler(async (req, res) => {
  const result = await searchResumesWorkflow(req.user, req.query);

  return successResponse(
    res,
    result,
    "Resumes fetched successfully",
    200
  );
});

/**
 * Get resume search suggestions (Recruiters only)
 */
export const getResumeSearchSuggestions = asyncHandler(async (req, res) => {
  const { field } = req.query;
  const suggestions = await getResumeSearchSuggestionsWorkflow(req.user, field);

  return successResponse(
    res,
    suggestions,
    "Suggestions fetched successfully",
    200
  );
});

/**
 * Score a resume
 */
export const scoreResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const result = await scoreResumeWorkflow(req.user, resumeId);

  return successResponse(
    res,
    result,
    "Resume scored successfully",
    200
  );
});

/**
 * Get resume score
 */
export const getResumeScore = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const scoreData = await getResumeScoreWorkflow(req.user, resumeId);

  return successResponse(
    res,
    scoreData,
    "Resume score fetched successfully",
    200
  );
});
