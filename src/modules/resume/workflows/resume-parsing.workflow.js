import path from "path";
import fs from "fs/promises";
import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findResumeById, updateResume } from "../repositories/resume.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { PdfResumeParser } from "../services/parsers/PdfResumeParser.service.js";
import { DocxResumeParser } from "../services/parsers/DocxResumeParser.service.js";
import { ResumeExtractor } from "../services/parsers/ResumeExtractor.service.js";

const RESUME_UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

const validateResumeAccess = async (user, resume) => {
  if (user.role === "CANDIDATE") {
    if (resume.candidateId !== user.id) {
      throw new AppError("Forbidden: You can only access your own resume", 403);
    }
  } else if (user.role === "HR" || user.role === "COMPANY_ADMIN") {
    const application = await prisma.application.findFirst({
      where: {
        resumeId: resume.id,
        job: { companyId: user.companyId || user.id },
      },
    });
    if (!application) {
      throw new AppError("Forbidden: Candidate has not applied to any of your company's jobs with this resume", 403);
    }
  } else {
    throw new AppError("Forbidden: Unauthorized role", 403);
  }
};

/**
 * Get parser based on MIME type
 */
const getParser = (mimeType) => {
  if (mimeType === "application/pdf") {
    return new PdfResumeParser();
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return new DocxResumeParser();
  } else if (mimeType === "application/msword") {
    throw new AppError("Legacy .doc files are not supported for parsing. Please convert to .pdf or .docx", 422);
  } else {
    throw new AppError("Unsupported file type for parsing. Only PDF and DOCX are allowed.", 422);
  }
};

export const parseResumeWorkflow = async (user, resumeId, forceReparse = false) => {
  // Only Candidate can trigger parse for their own resume (or system admin in future)
  if (user.role !== "CANDIDATE") {
    throw new AppError("Only candidates can trigger resume parsing.", 403);
  }

  const resume = await findResumeById(resumeId);
  if (!resume) throw new AppError("Resume not found", 404);

  await validateResumeAccess(user, resume);

  if (resume.parsingStatus === "COMPLETED" && !forceReparse) {
    return resume;
  }

  // Set processing status
  await updateResume(resumeId, { parsingStatus: "PROCESSING" });

  const safeKey = path.basename(resume.storageKey);
  const filePath = path.join(RESUME_UPLOAD_DIR, safeKey);

  let parsedData = null;
  let errorMsg = null;
  let status = "FAILED";

  try {
    const parser = getParser(resume.mimeType);
    const rawText = await parser.parse(filePath);

    const extractor = new ResumeExtractor();
    parsedData = extractor.extract(rawText);

    status = "COMPLETED";
  } catch (error) {
    errorMsg = error.message;
    console.error(`[Resume Parsing Error] ResumeID: ${resumeId}`, error);
  }

  // Update Database
  const updatedResume = await updateResume(resumeId, {
    parsingStatus: status,
    parsedData: parsedData || null,
    parsingError: errorMsg,
    parsedAt: status === "COMPLETED" ? new Date() : null,
    parserVersion: "v1.0.0",
  });

  // Log Activity
  const action =
    status === "COMPLETED"
      ? (resume.parsingStatus === "COMPLETED" ? ACTIVITY_ACTIONS.REPARSE : ACTIVITY_ACTIONS.PARSE)
      : ACTIVITY_ACTIONS.PARSE_FAILED;

  await logActivity({
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.RESUME,
    entityId: resume.id,
    action: action,
    metadata: { status, errorMsg, parserVersion: "v1.0.0" },
    performedByRole: user.role
  }).catch(err => console.error("Failed to log resume parse activity:", err));

  if (status === "FAILED") {
    throw new AppError(`Parsing failed: ${errorMsg}`, 422);
  }

  return updatedResume;
};

export const getParsedResumeWorkflow = async (user, resumeId) => {
  const resume = await findResumeById(resumeId);
  if (!resume) throw new AppError("Resume not found", 404);

  await validateResumeAccess(user, resume);

  if (resume.parsingStatus !== "COMPLETED") {
    throw new AppError(`Parsed data not available. Current status: ${resume.parsingStatus}`, 400);
  }

  return {
    id: resume.id,
    parsingStatus: resume.parsingStatus,
    parsedAt: resume.parsedAt,
    parserVersion: resume.parserVersion,
    data: resume.parsedData,
  };
};
