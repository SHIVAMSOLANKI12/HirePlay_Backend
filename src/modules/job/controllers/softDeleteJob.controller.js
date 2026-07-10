import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { softDeleteJobService } from "../services/softDeleteJob.service.js";

export const softDeleteJobController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await softDeleteJobService(req.user, id);

  return successResponse(
    res,
    null,
    "Job deleted successfully.",
    200
  );
});
