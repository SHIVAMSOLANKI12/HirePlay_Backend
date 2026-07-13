import asyncHandler from "../../../middleware/async.middleware.js";
import { registerSchema } from "../validations/candidate.validation.js";
import { registerCandidateService } from "../services/register.service.js";
import { successResponse } from "../../../utils/apiResponse.js";

export const registerCandidateController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);

  const result = await registerCandidateService(body);

  return successResponse(
    res,
    result,
    "Candidate registered successfully",
    201
  );
});
