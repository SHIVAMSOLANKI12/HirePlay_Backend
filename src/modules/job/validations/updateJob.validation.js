import { z } from "zod";

export const updateJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Job title cannot be empty if provided.")
    .max(150, "Job title cannot exceed 150 characters.")
    .optional(),
    
  department: z
    .string()
    .trim()
    .min(1, "Department cannot be empty if provided.")
    .optional(),
    
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ], { errorMap: () => ({ message: "Invalid employment type." }) }).optional(),
  
  experienceLevel: z.string().trim().optional(),
  
  location: z.string().trim().min(1, "Location cannot be empty if provided.").optional(),
  
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"], {
    errorMap: () => ({ message: "Invalid work mode." }),
  }).optional(),
  
  salaryMin: z.number().positive("Minimum salary must be positive.").optional(),
  
  salaryMax: z.number().positive("Maximum salary must be positive.").optional(),
  
  currency: z.string().trim().optional(),
  
  description: z.string().trim().min(1, "Job description cannot be empty if provided.").optional(),
  
  requirements: z.string().trim().min(1, "Job requirements cannot be empty if provided.").optional(),
  
  benefits: z.string().trim().optional(),

  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"], {
    errorMap: () => ({ message: "Invalid job status." }),
  }).optional(),
}).refine(
  (data) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: "Maximum salary must be greater than or equal to minimum salary.",
    path: ["salaryMax"],
  }
);
