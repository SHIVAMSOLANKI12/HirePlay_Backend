import asyncHandler from "../middleware/async.middleware.js";
import { registerSchema } from "../validations/auth.validation.js";
import { registerService } from "../services/auth.service.js";
import { successResponse } from "../utils/apiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);

  const result = await registerService(body);

  return successResponse(
    res,
    result,
    "User registered successfully",
    201
  );
});