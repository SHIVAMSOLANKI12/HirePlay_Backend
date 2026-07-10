import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getJobByIdService } from "../services/getJobById.service.js";

export const getJobByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await getJobByIdService(req.user, id);

  return successResponse(
    res,
    job,
    "Job fetched successfully.",
    200
  );
});
