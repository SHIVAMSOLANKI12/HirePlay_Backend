import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { updateApplicationStatusParamsSchema as applicationIdParamsSchema } from "../validations/updateApplicationStatus.validation.js";
import { getApplicationTimelineService } from "../services/getApplicationTimeline.service.js";

export const getApplicationTimelineController = asyncHandler(async (req, res) => {
  // Validate applicationId using existing schema
  const { applicationId } = applicationIdParamsSchema.parse(req.params);

  // Fetch timeline
  const timeline = await getApplicationTimelineService(req.user, applicationId);

  // Return standard response
  return successResponse(res, timeline, "Application timeline fetched successfully.", 200);
});
