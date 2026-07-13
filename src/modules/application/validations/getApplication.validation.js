import { z } from "zod";

export const getApplicationByIdParamsSchema = z.object({
  applicationId: z.string().uuid("Invalid Application ID"),
});
