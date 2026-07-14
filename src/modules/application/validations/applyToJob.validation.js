import { z } from "zod";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";

export const applyToJobParamsSchema = z.object({
  jobId: uuidSchema("Invalid Job ID"),
});

export const applyToJobBodySchema = z.object({
  resumeId: uuidSchema("Invalid Resume ID"),
  coverLetter: z.string().max(2000, "Cover letter too long").optional(),
});
