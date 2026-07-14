import { z } from "zod";

export const updateDecisionSchema = z.object({
  decision: z.enum(["PENDING", "NEXT_ROUND", "SELECTED", "REJECTED", "ON_HOLD"], {
    errorMap: () => ({ message: "Invalid decision value" })
  }),
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
});
