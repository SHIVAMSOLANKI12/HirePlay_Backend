import AppError from "../../../utils/AppError.js";
import { ALLOWED_RESUME_MIME_TYPES, MAX_RESUME_FILE_SIZE } from "../constants/file.constants.js";
import path from "path";

export const validateResumeFile = (file) => {
  if (!file) {
    throw new AppError("No file provided", 400);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  
  // Validate Mime Type
  if (!ALLOWED_RESUME_MIME_TYPES.includes(file.mimetype) || ext !== ".pdf") {
    throw new AppError("Only PDF files are allowed", 400);
  }

  // Validate File Size
  if (file.size > MAX_RESUME_FILE_SIZE) {
    throw new AppError("File size exceeds the 5MB limit", 400);
  }

  return true;
};
