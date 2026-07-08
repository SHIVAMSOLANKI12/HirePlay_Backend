import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getMeService } from "../services/me.service.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await getMeService(userId);

  return successResponse(
    res,
    user,
    "User fetched successfully",
    200
  );
});
