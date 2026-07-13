import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/AppError.js";
import { getApplicationByIdService } from "../services/getApplicationById.service.js";
import { getApplicationByIdParamsSchema } from "../validations/getApplication.validation.js";

export const getApplicationByIdController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;

  const paramResult = getApplicationByIdParamsSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new AppError("Invalid Application ID", 400);
  }

  const { applicationId } = paramResult.data;

  const application = await getApplicationByIdService(applicationId, candidateId);

  return successResponse(
    res,
    application,
    "Application fetched successfully.",
    200
  );
});
