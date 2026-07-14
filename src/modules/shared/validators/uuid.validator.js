import { z } from "zod";

export const uuidSchema = (message = "Invalid ID format") => z.string().uuid(message);
