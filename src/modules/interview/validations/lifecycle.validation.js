import { z } from "zod";

export const rescheduleInterviewSchema = z
  .object({
    scheduledAt: z.string().datetime({ message: "Invalid scheduledAt date format. Must be ISO-8601." }),
    durationMinutes: z.number().int().positive("Duration must be a positive integer"),
    timezone: z.string().trim().min(1, "Timezone is required"),
    meetingLink: z.string().url("Invalid meeting URL").optional().nullable(),
    location: z.string().trim().optional().nullable(),
    reason: z.string().trim().min(1, "Reschedule reason is required"),
  });

export const cancelInterviewSchema = z
  .object({
    reason: z.string().trim().min(1, "Cancellation reason is required"),
  });
