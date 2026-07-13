import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { applyToJob } from "../services/applyToJob.service.js";
import { applyToJobParamsSchema, applyToJobBodySchema } from "../validations/applyToJob.validation.js";
import AppError from "../../../utils/AppError.js";

export const applyToJobController = asyncHandler(async (req, res) => {
  // Validate params
  const paramResult = applyToJobParamsSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new AppError("Invalid Job ID", 400);
  }
  
  const { jobId } = paramResult.data;

  // Validate body
  const bodyPayload = applyToJobBodySchema.parse(req.body);

  // Call Service
  const applicationData = await applyToJob(req.user.id, jobId, bodyPayload);

  // Return success
  return successResponse(
    res,
    applicationData,
    "Application submitted successfully.",
    201
  );
});
