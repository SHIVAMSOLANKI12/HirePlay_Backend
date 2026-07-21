import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  uploadResumeService,
  getActiveResumeService,
  replaceResumeService,
  deleteResumeService,
} from "../services/resume.service.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";

export const uploadResumeController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;
  const file = req.file;

  const resume = await uploadResumeService(candidateId, file);

  logActivity({
    userId: candidateId,
    performedByRole: req.user.role,
    entityType: ACTIVITY_ENTITIES.RESUME,
    entityId: resume.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { fileName: resume.originalName, fileSize: resume.fileSize }
  }).catch(err => console.error("Failed to log resume upload:", err));

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

  logActivity({
    userId: candidateId,
    performedByRole: req.user.role,
    entityType: ACTIVITY_ENTITIES.RESUME,
    entityId: resume.id,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { fileName: resume.originalName, fileSize: resume.fileSize }
  }).catch(err => console.error("Failed to log resume replace:", err));

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

  logActivity({
    userId: candidateId,
    performedByRole: req.user.role,
    entityType: ACTIVITY_ENTITIES.RESUME,
    action: ACTIVITY_ACTIONS.DELETE,
    metadata: { message: "Resume deleted" }
  }).catch(err => console.error("Failed to log resume delete:", err));

  return successResponse(
    res,
    result,
    "Resume deleted successfully",
    200
  );
});
