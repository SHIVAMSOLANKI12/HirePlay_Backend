import { z } from "zod";

export const updateHRSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name cannot exceed 50 characters.")
    .optional(),
    
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name cannot exceed 50 characters.")
    .optional(),
    
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters.")
    .optional(),
    
  designation: z
    .string()
    .trim()
    .max(100, "Designation cannot exceed 100 characters.")
    .optional(),
    
  status: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
      errorMap: () => ({ message: "Status must be ACTIVE, INACTIVE, or SUSPENDED." })
    })
    .optional(),
}).strict();
