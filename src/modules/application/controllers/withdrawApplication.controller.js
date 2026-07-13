import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/AppError.js";
import { withdrawApplicationService } from "../services/withdrawApplication.service.js";
import { getApplicationByIdParamsSchema } from "../validations/getApplication.validation.js";

export const withdrawApplicationController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;

  const paramResult = getApplicationByIdParamsSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new AppError("Invalid Application ID", 400);
  }

  const { applicationId } = paramResult.data;

  const updatedApplication = await withdrawApplicationService(applicationId, candidateId);

  return successResponse(
    res,
    updatedApplication,
    "Application withdrawn successfully.",
    200
  );
});
