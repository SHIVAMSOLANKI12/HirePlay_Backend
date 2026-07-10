import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getAllJobsQuerySchema } from "../validations/getAllJobs.validation.js";
import { getAllJobsService } from "../services/getAllJobs.service.js";

export const getAllJobsController = asyncHandler(async (req, res) => {
  const queryParams = getAllJobsQuerySchema.parse(req.query);

  const responseData = await getAllJobsService(req.user, queryParams);

  return successResponse(
    res,
    responseData,
    "Jobs fetched successfully.",
    200
  );
});
