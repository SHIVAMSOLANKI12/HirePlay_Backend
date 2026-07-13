import asyncHandler from "../../../middleware/async.middleware.js";
import { updateProfileSchema } from "../validations/candidate.validation.js";
import {
  getCandidateProfileService,
  updateCandidateProfileService,
} from "../services/profile.service.js";
import { successResponse } from "../../../utils/apiResponse.js";

export const getMeController = asyncHandler(async (req, res) => {
  const candidate = await getCandidateProfileService(req.user.id);
  
  return successResponse(
    res,
    candidate,
    "Candidate profile fetched successfully",
    200
  );
});

export const updateMeController = asyncHandler(async (req, res) => {
  const body = updateProfileSchema.parse(req.body);

  const updatedCandidate = await updateCandidateProfileService(req.user.id, body);

  return successResponse(
    res,
    updatedCandidate,
    "Candidate profile updated successfully",
    200
  );
});
