import { z } from "zod";
import { paginationSchema } from "../../shared/validators/pagination.validator.js";
import { searchSchema } from "../../shared/validators/search.validator.js";
import { sortSchema } from "../../shared/validators/sort.validator.js";
import { JOB_STATUS } from "../../shared/constants/job.constants.js";

const jobSpecificQuerySchema = z.object({
  status: z.enum([JOB_STATUS.DRAFT, JOB_STATUS.PUBLISHED, JOB_STATUS.CLOSED, JOB_STATUS.ARCHIVED]).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]).optional(),
});

const jobSortSchema = z.object({
  sortBy: z.enum(["createdAt", "title", "status"]).default("createdAt"),
});

export const getAllJobsQuerySchema = paginationSchema
  .merge(searchSchema)
  .merge(sortSchema)
  .merge(jobSortSchema)
  .merge(jobSpecificQuerySchema);
