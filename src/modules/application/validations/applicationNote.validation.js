import { z } from "zod";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";

export const applicationNoteParamsSchema = z.object({
  noteId: uuidSchema("Invalid Note ID"),
});

export const applicationIdParamsSchema = z.object({
  applicationId: uuidSchema("Invalid Application ID"),
});

export const createApplicationNoteSchema = z.object({
  note: z.string().trim().min(1, "Note content is required"),
});

export const updateApplicationNoteSchema = z.object({
  note: z.string().trim().min(1, "Note content is required"),
});
