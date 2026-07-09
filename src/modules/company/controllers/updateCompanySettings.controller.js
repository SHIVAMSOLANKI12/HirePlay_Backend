import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { updateCompanySettingsService } from "../services/updateCompanySettings.service.js";
import { updateCompanySettingsSchema } from "../validations/companySettings.validation.js";

export const updateCompanySettings = asyncHandler(async (req, res) => {
  const payload = updateCompanySettingsSchema.parse(req.body);

  const settings = await updateCompanySettingsService(req.user.id, payload);

  return successResponse(
    res,
    settings,
    "Company settings updated successfully.",
    COMPANY_HTTP_STATUS.OK
  );
});
