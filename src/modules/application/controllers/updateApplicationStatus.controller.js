import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { 
  updateApplicationStatusParamsSchema, 
  updateApplicationStatusBodySchema,
  bulkUpdateApplicationStatusBodySchema
} from "../validations/updateApplicationStatus.validation.js";
import { updateApplicationStatusWorkflow } from "../workflows/updateApplicationStatus.workflow.js";
import { bulkUpdateApplicationStatusWorkflow } from "../workflows/bulkUpdateApplicationStatus.workflow.js";
import { toRecruiterDetails } from "../../shared/mappers/application.mapper.js";

export const updateApplicationStatusController = asyncHandler(async (req, res) => {
  const { applicationId } = updateApplicationStatusParamsSchema.parse(req.params);
  const { status, metadata } = updateApplicationStatusBodySchema.parse(req.body);

  const updatedApp = await updateApplicationStatusWorkflow(req.user, applicationId, status, metadata);

  return successResponse(
    res,
    toRecruiterDetails(updatedApp),
    "Application status updated successfully.",
    200
  );
});

export const bulkUpdateApplicationStatusController = asyncHandler(async (req, res) => {
  const { applicationIds, status } = bulkUpdateApplicationStatusBodySchema.parse(req.body);

  const updatedApps = await bulkUpdateApplicationStatusWorkflow(req.user, applicationIds, status);

  return successResponse(
    res,
    updatedApps.map(toRecruiterDetails),
    "Applications status updated successfully.",
    200
  );
});
