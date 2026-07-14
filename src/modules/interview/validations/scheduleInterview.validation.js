import { z } from "zod";

export const scheduleInterviewSchema = z
  .object({
    applicationId: z.string().uuid("Invalid Application ID"),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    type: z.enum(["ONLINE", "OFFLINE", "PHONE"], {
      errorMap: () => ({ message: "Invalid interview type" }),
    }),
    scheduledAt: z.string().datetime({ message: "Invalid scheduledAt date format. Must be ISO-8601." }),
    durationMinutes: z.number().int().positive("Duration must be a positive integer"),
    timezone: z.string().trim().min(1, "Timezone is required"),
    meetingLink: z.string().url("Invalid meeting URL").optional().nullable(),
    location: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "ONLINE" && (!data.meetingLink || data.meetingLink.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "meetingLink is required for ONLINE interviews",
      path: ["meetingLink"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "OFFLINE" && (!data.location || data.location.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "location is required for OFFLINE interviews",
      path: ["location"],
    }
  );
