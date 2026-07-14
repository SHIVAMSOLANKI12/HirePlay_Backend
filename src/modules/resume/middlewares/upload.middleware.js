import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { validateResumeFile } from "../../shared/services/fileValidation.service.js";
import { MAX_RESUME_FILE_SIZE } from "../../shared/constants/file.constants.js";

const RESUME_UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

// Ensure directory exists sync (since multer storage setup is sync-ish)
if (!fs.existsSync(RESUME_UPLOAD_DIR)) {
  fs.mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, RESUME_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Generate unique storage key: timestamp + random bytes + original extension
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(6).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  try {
    validateResumeFile({ ...file, size: 0 }); // Size is 0 here as multer hasn't read it yet
    cb(null, true);
  } catch (error) {
    cb(new Error(error.message), false);
  }
};

export const uploadResumeMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE,
  },
});

// Middleware to handle multer errors gracefully
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ success: false, message: `File too large, max size is ${MAX_RESUME_FILE_SIZE / (1024 * 1024)}MB` });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};
