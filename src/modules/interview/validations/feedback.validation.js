import { z } from "zod";

const baseFeedbackSchema = {
  overallRating: z.number().min(0, "Rating must be between 0 and 5").max(5, "Rating must be between 0 and 5"),
  recommendation: z.enum(["STRONG_HIRE", "HIRE", "HOLD", "NO_HIRE"], {
    errorMap: () => ({ message: "Invalid hiring recommendation" }),
  }),
  technicalScore: z.number().int().min(1).max(5).optional().nullable(),
  communicationScore: z.number().int().min(1).max(5).optional().nullable(),
  problemSolvingScore: z.number().int().min(1).max(5).optional().nullable(),
  cultureFitScore: z.number().int().min(1).max(5).optional().nullable(),
  strengths: z.string().trim().optional().nullable(),
  weaknesses: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
};

export const createFeedbackSchema = z.object(baseFeedbackSchema);

export const updateFeedbackSchema = z.object({
  ...baseFeedbackSchema,
  overallRating: baseFeedbackSchema.overallRating.optional(),
  recommendation: baseFeedbackSchema.recommendation.optional(),
});
