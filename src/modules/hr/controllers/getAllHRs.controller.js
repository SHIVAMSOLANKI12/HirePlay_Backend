import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getAllHRsService } from "../services/getAllHRs.service.js";
import { getAllHRsQuerySchema } from "../validations/getAllHRs.validation.js";

export const getAllHRsController = asyncHandler(async (req, res) => {
  const queryParams = getAllHRsQuerySchema.parse(req.query);

  const responseData = await getAllHRsService(req.user.id, queryParams);

  return successResponse(
    res,
    responseData,
    "HRs fetched successfully.",
    200
  );
});
