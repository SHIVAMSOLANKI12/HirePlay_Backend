import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { updateHRSchema } from "../validations/updateHR.validation.js";
import { updateHRService } from "../services/updateHR.service.js";

export const updateHRController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = updateHRSchema.parse(req.body);

  const updatedHR = await updateHRService(req.user.id, id, payload);

  return successResponse(
    res,
    updatedHR,
    "HR updated successfully.",
    200
  );
});
