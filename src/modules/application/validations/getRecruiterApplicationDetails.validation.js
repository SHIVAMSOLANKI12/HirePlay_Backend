import { z } from "zod";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";

export const getRecruiterApplicationDetailsParamsSchema = z.object({
  applicationId: uuidSchema("Invalid Application ID"),
});
