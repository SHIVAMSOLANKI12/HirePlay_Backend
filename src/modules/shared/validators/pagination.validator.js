import { z } from "zod";
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "../constants/pagination.constants.js";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(MAX_LIMIT, `Limit cannot exceed ${MAX_LIMIT}`).default(DEFAULT_LIMIT),
});
