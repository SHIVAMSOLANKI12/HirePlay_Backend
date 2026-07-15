import { z } from "zod";
import { uuidSchema } from "../../shared/validators/uuid.validator.js";

export const createOfferSchema = z.object({
  body: z.object({
    applicationId: uuidSchema("Invalid Application ID"),
    jobTitle: z.string().min(2, "Job Title must be at least 2 characters"),
    department: z.string().min(2, "Department must be at least 2 characters"),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"], {
      errorMap: () => ({ message: "Invalid employment type" }),
    }),
    salary: z.number().positive("Salary must be positive"),
    currency: z.string().min(3).max(3).default("USD"),
    joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid joining date format",
    }),
    location: z.string().min(2, "Location is required"),
    reportingManager: z.string().min(2, "Reporting manager is required"),
    validUntil: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid valid until date format",
    }),
    notes: z.string().optional(),
  })
});

export const updateOfferSchema = z.object({
  params: z.object({
    offerId: uuidSchema("Invalid Offer ID"),
  }),
  body: z.object({
    status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"]).optional(),
    salary: z.number().positive("Salary must be positive").optional(),
    joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid joining date format",
    }).optional(),
    location: z.string().min(2).optional(),
    reportingManager: z.string().min(2).optional(),
    validUntil: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid valid until date format",
    }).optional(),
    notes: z.string().optional(),
  })
});
