import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getRecruiterApplicationDetailsParamsSchema } from "../validations/getRecruiterApplicationDetails.validation.js";
import { getRecruiterApplicationDetailsService } from "../services/getRecruiterApplicationDetails.service.js";

export const getRecruiterApplicationDetailsController = asyncHandler(async (req, res) => {
  // 1. Validate applicationId
  const { applicationId } = getRecruiterApplicationDetailsParamsSchema.parse(req.params);

  // 2. Fetch Recruiter Applicant Details
  const applicationDetails = await getRecruiterApplicationDetailsService(req.user, applicationId);

  // 3. Return standard response
  return successResponse(res, applicationDetails, "Application details fetched successfully.", 200);
});
