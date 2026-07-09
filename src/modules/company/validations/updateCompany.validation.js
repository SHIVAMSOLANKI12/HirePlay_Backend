import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name cannot exceed 100 characters.")
    .optional(),

  email: z
    .email("Invalid company email.")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),

  website: z
    .url("Invalid website URL.")
    .optional()
    .or(z.literal("")),

  industry: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),

  companySize: z.enum([
    "SOLO",
    "SMALL",
    "MEDIUM",
    "LARGE",
    "ENTERPRISE",
  ]).optional(),

  logo: z
    .url("Invalid logo URL.")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
}).strict();
