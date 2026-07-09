import asyncHandler from "../../../middleware/async.middleware.js";
import { COMPANY_MESSAGES, COMPANY_HTTP_STATUS } from "../constants/company.constants.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { createCompanyService } from "../services/createCompany.service.js";

import { createCompanySchema } from "../validations/createCompany.validation.js";

export const createCompany = asyncHandler(async (req, res) => {
    const body = createCompanySchema.parse(req.body);

    const company = await createCompanyService(
        body,
        req.user.id
    );

    return successResponse(
        res,
        company,
        COMPANY_MESSAGES.CREATED,
        COMPANY_HTTP_STATUS.CREATED
    );
});