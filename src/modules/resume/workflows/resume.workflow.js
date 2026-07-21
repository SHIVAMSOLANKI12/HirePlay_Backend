import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findResumeById } from "../repositories/resume.repository.js";
import { PrismaResumeSearchProvider } from "../services/search/PrismaResumeSearch.provider.js";
import { RuleBasedResumeScoringProvider } from "../services/scoring/RuleBasedResumeScoringProvider.js";
import { LocalStorageProvider } from "../../../shared/providers/storage/local-storage.provider.js";
import path from "path";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";

const storageProvider = new LocalStorageProvider();
const searchProvider = new PrismaResumeSearchProvider();
const scoringProvider = new RuleBasedResumeScoringProvider();
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
    }).catch(err => console.error("Failed to log resume download/preview activity:", err));
  });
};

export const searchResumesWorkflow = async (user, queryOptions) => {
  if (user.role !== "HR" && user.role !== "COMPANY_ADMIN") {
    throw new AppError("Forbidden: Only recruiters can search resumes.", 403);
  }

  const companyId = user.companyId || user.id;

  // Process filters
  if (queryOptions.skills && typeof queryOptions.skills === "string") {
    queryOptions.skills = queryOptions.skills.split(",").map(s => s.trim()).filter(Boolean);
  }

  if (queryOptions.resumeStatus !== undefined) {
    queryOptions.resumeStatus = queryOptions.resumeStatus === "true";
  }

  const result = await searchProvider.search(companyId, queryOptions);

  // Log activity
  logActivity({
    companyId: companyId,
    performedByRole: user.role,
    entityType: ACTIVITY_ENTITIES.RESUME,
    action: ACTIVITY_ACTIONS.SEARCH, 
    metadata: { query: queryOptions.q || null, filtersApplied: Object.keys(queryOptions).length }
  }).catch(err => console.error("Failed to log resume search activity:", err));

  return result;
};

export const getResumeSearchSuggestionsWorkflow = async (user, field) => {
  if (user.role !== "HR" && user.role !== "COMPANY_ADMIN") {
    throw new AppError("Forbidden: Only recruiters can fetch suggestions.", 403);
  }

  const companyId = user.companyId || user.id;

  const validFields = ["skills"];
  if (!validFields.includes(field)) {
    throw new AppError(`Invalid field for suggestions. Allowed: ${validFields.join(", ")}`, 400);
  }

  const suggestions = await searchProvider.getSuggestions(companyId, field);
  return suggestions;
};

export const scoreResumeWorkflow = async (user, resumeId, forceReScore = false) => {
  const resume = await findResumeById(resumeId, true); // true to include parsedData
  await validateResumeAccess(user, resume);

  if (resume.parsingStatus !== "COMPLETED" || !resume.parsedData) {
    throw new AppError("Resume must be successfully parsed before scoring", 400);
  }

  // Caching mechanism: Avoid recalculating if already completed and not forced
  if (resume.aiScoreStatus === "COMPLETED" && !forceReScore) {
    return resume;
  }

  // Update status to processing
  await prisma.resume.update({
    where: { id: resumeId },
    data: { aiScoreStatus: "PROCESSING" }
  });

  try {
    const scoreResult = await scoringProvider.score(resume.parsedData);
    
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        aiScore: scoreResult.score,
        aiScoreBreakdown: scoreResult.breakdown,
        aiScoreVersion: scoreResult.version,
        scoringProvider: scoreResult.providerName,
        aiScoreStatus: "COMPLETED",
        aiScoredAt: new Date()
      }
    });

    const isRescore = resume.aiScore !== null;
    
    // Log activity
    logActivity({
      companyId: user.companyId || user.id, // For HR/Admin (for Candidate it's irrelevant or candidate's own tracking)
      userId: user.role === "CANDIDATE" ? user.id : undefined,
      performedByRole: user.role,
      entityType: ACTIVITY_ENTITIES.RESUME,
      entityId: resume.id,
      action: isRescore ? ACTIVITY_ACTIONS.RE_SCORE : ACTIVITY_ACTIONS.SCORE,
      metadata: { score: scoreResult.score, provider: scoreResult.providerName }
    }).catch(err => console.error("Failed to log resume scoring activity:", err));

    return updatedResume;
  } catch (error) {
    await prisma.resume.update({
      where: { id: resumeId },
      data: { aiScoreStatus: "FAILED" }
    });
    console.error("Resume scoring failed:", error);
    throw new AppError("Failed to score resume", 500);
  }
};

export const getResumeScoreWorkflow = async (user, resumeId) => {
  const resume = await findResumeById(resumeId);
  await validateResumeAccess(user, resume);

  if (resume.aiScoreStatus !== "COMPLETED") {
    return {
      status: resume.aiScoreStatus,
      message: "Score is not yet available."
    };
  }

  return {
    status: resume.aiScoreStatus,
    score: resume.aiScore,
    breakdown: resume.aiScoreBreakdown,
    version: resume.aiScoreVersion,
    provider: resume.scoringProvider,
    scoredAt: resume.aiScoredAt
  };
};
