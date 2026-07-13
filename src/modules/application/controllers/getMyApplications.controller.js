import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { getMyApplicationsService } from "../services/getMyApplications.service.js";

export const getMyApplicationsController = asyncHandler(async (req, res) => {
  const candidateId = req.user.id;
  
  const data = await getMyApplicationsService(candidateId, req.query);

  return successResponse(
    res,
    data,
    "Applications fetched successfully.",
    200
  );
});
