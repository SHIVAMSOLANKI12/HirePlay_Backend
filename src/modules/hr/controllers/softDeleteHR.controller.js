import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { softDeleteHRService } from "../services/softDeleteHR.service.js";

export const softDeleteHRController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await softDeleteHRService(req.user.id, id);

  return successResponse(
    res,
    null,
    "HR deleted successfully.",
    200
  );
});
