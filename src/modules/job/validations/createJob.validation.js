import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Job title is required.")
    .max(150, "Job title cannot exceed 150 characters."),
    
  department: z
    .string()
    .trim()
    .min(1, "Department is required."),
    
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ], { errorMap: () => ({ message: "Invalid employment type." }) }),
  
  experienceLevel: z.string().trim().optional(),
  
  location: z.string().trim().min(1, "Location is required."),
  
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"], {
    errorMap: () => ({ message: "Invalid work mode." }),
  }),
  
  salaryMin: z.number().positive("Minimum salary must be positive.").optional(),
  
  salaryMax: z.number().positive("Maximum salary must be positive.").optional(),
  
  currency: z.string().trim().default("USD"),
  
  description: z.string().trim().min(1, "Job description is required."),
  
  requirements: z.string().trim().min(1, "Job requirements are required."),
  
  benefits: z.string().trim().optional(),
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
