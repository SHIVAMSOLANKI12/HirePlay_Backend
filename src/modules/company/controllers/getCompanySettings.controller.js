import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { getCompanySettingsService } from "../services/getCompanySettings.service.js";

export const getCompanySettings = asyncHandler(async (req, res) => {
  const settings = await getCompanySettingsService(req.user.id);

  return successResponse(
    res,
    settings,
    "Company settings fetched successfully.",
    COMPANY_HTTP_STATUS.OK
  );
});
