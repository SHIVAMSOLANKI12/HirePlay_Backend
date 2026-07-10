import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { createHRSchema } from "../validations/createHR.validation.js";
import { createHRService } from "../services/createHR.service.js";

export const createHRController = asyncHandler(async (req, res) => {
  const payload = createHRSchema.parse(req.body);

  const newHR = await createHRService(req.user.id, payload);

  return successResponse(
    res,
    newHR,
    "HR created successfully.",
    201
  );
});
