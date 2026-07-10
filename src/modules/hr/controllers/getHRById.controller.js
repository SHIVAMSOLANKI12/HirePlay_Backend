import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getHRByIdService } from "../services/getHRById.service.js";

export const getHRByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hr = await getHRByIdService(req.user.id, id);

  return successResponse(
    res,
    hr,
    "HR fetched successfully.",
    200
  );
});
