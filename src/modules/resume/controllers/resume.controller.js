import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  uploadResumeService,
  getActiveResumeService,
  replaceResumeService,
  deleteResumeService,
} from "../services/resume.service.js";

export const uploadResumeController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;
  const file = req.file;

  const resume = await uploadResumeService(candidateId, file);

  return successResponse(
    res,
    resume,
    "Resume uploaded successfully",
    201
  );
});

export const getResumeController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;
  
  const resume = await getActiveResumeService(candidateId);

  return successResponse(
    res,
    resume,
    "Active resume fetched successfully",
    200
  );
});

export const replaceResumeController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;
  const file = req.file;

  const resume = await replaceResumeService(candidateId, file);

  return successResponse(
    res,
    resume,
    "Resume replaced successfully",
    200
  ); // Sometimes 201 could be used, but 200 is good for PATCH/Replace
});

export const deleteResumeController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;

  const result = await deleteResumeService(candidateId);

  return successResponse(
    res,
    result,
    "Resume deleted successfully",
    200
  );
});
