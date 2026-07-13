import asyncHandler from "../../../middleware/async.middleware.js";
import { loginSchema } from "../validations/candidate.validation.js";
import { loginCandidateService } from "../services/login.service.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { setRefreshCookie } from "../../auth/utils/authToken.util.js";

export const loginCandidateController = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const result = await loginCandidateService(body);

  setRefreshCookie(res, result.refreshToken);

  return successResponse(
    res,
    result,
    "Candidate logged in successfully",
    200
  );
});
