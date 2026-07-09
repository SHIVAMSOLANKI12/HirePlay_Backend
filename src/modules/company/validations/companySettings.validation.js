import { z } from "zod";

export const updateCompanySettingsSchema = z.object({
  timezone: z
    .string()
    .trim()
    .max(100, "Timezone cannot exceed 100 characters.")
    .optional(),

  language: z
    .string()
    .trim()
    .max(20, "Language cannot exceed 20 characters.")
    .optional(),

  currency: z
    .string()
    .trim()
    .max(10, "Currency cannot exceed 10 characters.")
    .optional(),

  dateFormat: z
    .enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], {
      errorMap: () => ({ message: "Invalid date format." })
    })
    .optional(),

  timeFormat: z
    .enum(["12h", "24h"], {
      errorMap: () => ({ message: "Invalid time format." })
    })
    .optional(),

  emailNotifications: z
    .boolean()
    .optional(),

  smsNotifications: z
    .boolean()
    .optional(),

  careerPagePublic: z
    .boolean()
    .optional(),

  defaultHiringStage: z
    .string()
    .trim()
    .max(50, "Default hiring stage cannot exceed 50 characters.")
    .optional(),
}).strict();
