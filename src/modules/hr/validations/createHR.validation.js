import { z } from "zod";

export const createHRSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name cannot exceed 50 characters."),
    
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name cannot exceed 50 characters."),
    
  email: z
    .string()
    .trim()
    .email("Invalid email address."),
    
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters."),
    
  designation: z
    .string()
    .trim()
    .max(100, "Designation cannot exceed 100 characters."),
    
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
});
