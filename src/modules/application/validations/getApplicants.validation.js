import { z } from "zod";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";
import { paginationSchema } from "../../shared/validators/pagination.validator.js";
import { searchSchema } from "../../shared/validators/search.validator.js";
import { sortSchema } from "../../shared/validators/sort.validator.js";
import { APPLICATION_STATUS } from "../../shared/constants/applicationStatus.constants.js";

export const getApplicantsParamsSchema = z.object({
  jobId: uuidSchema("Invalid Job ID"),
});

const applicantSortSchema = z.object({
  sortBy: z.enum(["appliedAt", "status", "candidateName"]).default("appliedAt"),
});

const applicantSpecificQuerySchema = z.object({
  status: z.enum([
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.SCREENING,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN
  ]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  hasResume: z.enum(["true", "false"]).transform((val) => val === "true").optional(),
});

export const getApplicantsQuerySchema = paginationSchema
  .merge(searchSchema)
  .merge(sortSchema)
  .merge(applicantSortSchema)
  .merge(applicantSpecificQuerySchema);
