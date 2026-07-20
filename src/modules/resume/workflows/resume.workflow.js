import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findResumeById } from "../repositories/resume.repository.js";
import { LocalStorageProvider } from "../../../shared/providers/storage/local-storage.provider.js";
import path from "path";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";

const storageProvider = new LocalStorageProvider();
const RESUME_UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

/**
 * Validates if the user has access to this resume.
 */
const validateResumeAccess = async (user, resume) => {
  if (user.role === "CANDIDATE") {
    if (resume.candidateId !== user.id) {
      throw new AppError("Forbidden: You can only access your own resume", 403);
    }
  } else if (user.role === "HR" || user.role === "COMPANY_ADMIN") {
    // For recruiters, they must belong to a company where the candidate applied using this resume
    const application = await prisma.application.findFirst({
      where: {
        resumeId: resume.id,
        job: {
          companyId: user.companyId || user.id, // Depending on if it's HR or Company Admin
        },
      },
    });

    if (!application) {
      throw new AppError("Forbidden: Candidate has not applied to any of your company's jobs with this resume", 403);
    }
  } else {
    throw new AppError("Forbidden: Unauthorized role", 403);
  }
};

export const getResumeMetadataWorkflow = async (user, resumeId) => {
  const resume = await findResumeById(resumeId);
  if (!resume) throw new AppError("Resume not found", 404);

  await validateResumeAccess(user, resume);

  // Exclude internal fields for metadata response
  return {
    id: resume.id,
    candidateId: resume.candidateId,
    originalName: resume.originalName,
    mimeType: resume.mimeType,
    fileSize: resume.fileSize,
    version: resume.isActive ? "ACTIVE" : "INACTIVE",
    uploadedAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    storageProvider: "LocalStorage",
  };
};

export const streamResumeWorkflow = async (user, resumeId, res, isDownload = false) => {
  const resume = await findResumeById(resumeId);
  if (!resume) throw new AppError("Resume not found", 404);

  await validateResumeAccess(user, resume);

  // Get stream from storage provider
  const readStream = storageProvider.getReadStream(resume.storageKey, RESUME_UPLOAD_DIR);

  // Set response headers
  res.setHeader("Content-Type", resume.mimeType);
  res.setHeader("Content-Length", resume.fileSize);
  
  if (isDownload) {
    res.setHeader("Content-Disposition", `attachment; filename="${resume.originalName}"`);
  } else {
    res.setHeader("Content-Disposition", `inline; filename="${resume.originalName}"`);
  }

  // Handle stream errors
  readStream.on("error", (err) => {
    console.error("[Stream Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Error streaming file" });
    }
  });

  // Pipe to response
  readStream.pipe(res);

  // Log activity once the stream ends successfully
  readStream.on("end", () => {
    const action = isDownload ? ACTIVITY_ACTIONS.DOWNLOAD : ACTIVITY_ACTIONS.PREVIEW;
    
    // Log asynchronously
    logActivity({
      companyId: (user.role !== "CANDIDATE") ? (user.companyId || user.id) : null,
      userId: user.id,
      entityType: ACTIVITY_ENTITIES.RESUME,
      entityId: resume.id,
      action: action,
      metadata: { originalName: resume.originalName, size: resume.fileSize },
      performedByRole: user.role
    }).catch(err => console.error("Failed to log resume activity:", err));
  });
};
