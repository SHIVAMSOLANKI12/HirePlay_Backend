import { z } from "zod";

export const applyToJobParamsSchema = z.object({
  jobId: z.string().uuid("Invalid Job ID"),
});

export const applyToJobBodySchema = z.object({
  resumeId: z.string().uuid("Invalid Resume ID"),
  coverLetter: z.string().trim().optional(),
});
