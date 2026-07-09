import asyncHandler from "../../../middleware/async.middleware.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { updateCompanyService } from "../services/updateCompany.service.js";
import { updateCompanySchema } from "../validations/updateCompany.validation.js";

export const updateCompany = asyncHandler(async (req, res) => {
  const body = updateCompanySchema.parse(req.body);

  const company = await updateCompanyService(body, req.user.id);

  return successResponse(
    res,
    company,
    COMPANY_MESSAGES.UPDATED,
    COMPANY_HTTP_STATUS.OK
  );
});
