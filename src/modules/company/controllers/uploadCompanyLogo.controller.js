import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { uploadCompanyLogoService } from "../services/uploadCompanyLogo.service.js";

export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  const company = await uploadCompanyLogoService(req.user.id, req.file);

  return successResponse(
    res,
    { logo: company.logo },
    "Company logo uploaded successfully.",
    COMPANY_HTTP_STATUS.OK
  );
});
