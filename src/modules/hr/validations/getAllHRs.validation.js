import { z } from "zod";

export const getAllHRsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  search: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  sortBy: z.enum(["createdAt", "firstName", "designation"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
