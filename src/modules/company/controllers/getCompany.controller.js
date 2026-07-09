import asyncHandler from "../../../middleware/async.middleware.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { successResponse } from "../../../utils/apiResponse.js";
import getCompanyService from "../services/getCompany.service.js";

export const getCompany = asyncHandler(async (req, res) => {
  const company = await getCompanyService.execute(req.user.id);

  return successResponse(
    res,
    company,
    COMPANY_MESSAGES.FETCHED,
    COMPANY_HTTP_STATUS.OK
  );
});