import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { updateJobSchema } from "../validations/updateJob.validation.js";
import { updateJobService } from "../services/updateJob.service.js";

export const updateJobController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = updateJobSchema.parse(req.body);

  const updatedJob = await updateJobService(req.user, id, payload);

  return successResponse(
    res,
    updatedJob,
    "Job updated successfully.",
    200
  );
});
