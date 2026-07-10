import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { createJobSchema } from "../validations/createJob.validation.js";
import { createJobService } from "../services/createJob.service.js";

export const createJobController = asyncHandler(async (req, res) => {
  const payload = createJobSchema.parse(req.body);

  const newJob = await createJobService(req.user, payload);

  return successResponse(
    res,
    newJob,
    "Job created successfully.",
    201
  );
});
