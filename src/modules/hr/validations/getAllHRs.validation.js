import { z } from "zod";
import { paginationSchema } from "../../shared/validators/pagination.validator.js";
import { searchSchema } from "../../shared/validators/search.validator.js";
import { sortSchema } from "../../shared/validators/sort.validator.js";

const hrSortSchema = z.object({
  sortBy: z.enum(["createdAt", "firstName", "designation"]).default("createdAt"),
});

const hrSpecificQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const getAllHRsQuerySchema = paginationSchema
  .merge(searchSchema)
  .merge(sortSchema)
  .merge(hrSortSchema)
  .merge(hrSpecificQuerySchema);
