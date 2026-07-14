import { z } from "zod";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";
import { APPLICATION_STATUS } from "../../shared/constants/applicationStatus.constants.js";

export const updateApplicationStatusParamsSchema = z.object({
  applicationId: uuidSchema("Invalid Application ID"),
});

export const updateApplicationStatusBodySchema = z.object({
  status: z.enum([
    APPLICATION_STATUS.SCREENING,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ], {
    errorMap: () => ({ message: "Invalid or unauthorized application status transition" }),
  }),
});

export const bulkUpdateApplicationStatusBodySchema = z.object({
  applicationIds: z.array(uuidSchema("Invalid Application ID in array")).min(1, "At least one application ID is required"),
  status: z.enum([
    APPLICATION_STATUS.SCREENING,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ], {
    errorMap: () => ({ message: "Invalid or unauthorized application status transition" }),
  }),
});
