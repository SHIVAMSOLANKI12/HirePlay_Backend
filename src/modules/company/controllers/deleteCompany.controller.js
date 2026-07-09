import asyncHandler from "../../../middleware/async.middleware.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { deleteCompanyService } from "../services/deleteCompany.service.js";

export const deleteCompany = asyncHandler(async (req, res) => {
  await deleteCompanyService(req.user.id);

  return successResponse(
    res,
    null,
    COMPANY_MESSAGES.DELETED,
    COMPANY_HTTP_STATUS.OK
  );
});
