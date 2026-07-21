import path from "path";
import AppError from "../../../utils/AppError.js";
import { LocalStorageProvider } from "../../../shared/providers/storage/local-storage.provider.js";
import {
  createResume,
  createResumeWithDeactivation,
  getActiveResumeByCandidateId,
  deactivateResumesByCandidateId,
  softDeleteResume,
} from "../repositories/resume.repository.js";

// Initialize the storage provider. In the future, this can be swapped with S3Provider, etc.
const storageProvider = new LocalStorageProvider();
const RESUME_UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

export const uploadResumeService = async (candidateId, file) => {
  if (!file) {
    throw new AppError("No file uploaded. Please ensure you are sending 'multipart/form-data' with the key 'file'.", 400);
  }

  // Use storage provider to handle the file
  const fileData = await storageProvider.uploadFile(file, RESUME_UPLOAD_DIR);

  // Use transactional update and create
  const resume = await createResumeWithDeactivation(candidateId, {
    candidateId,
    fileName: fileData.fileName,
    originalName: fileData.originalName,
    mimeType: fileData.mimeType,
    fileSize: fileData.size,
    storageKey: fileData.key,
    fileUrl: fileData.url,
    isActive: true,
  });

  return resume;
};

export const getActiveResumeService = async (candidateId) => {
  const resume = await getActiveResumeByCandidateId(candidateId);
  if (!resume) {
    throw new AppError("Active resume not found", 404);
  }
  return resume;
};

export const replaceResumeService = async (candidateId, file) => {
  if (!file) {
    throw new AppError("No file uploaded. Please ensure you are sending 'multipart/form-data' with the key 'file'.", 400);
  }

  // Basically the same as upload, as it will deactivate existing and create a new active one
  return await uploadResumeService(candidateId, file);
};

export const deleteResumeService = async (candidateId) => {
  const activeResume = await getActiveResumeByCandidateId(candidateId);
  if (!activeResume) {
    throw new AppError("Active resume not found", 404);
  }

  await softDeleteResume(activeResume.id);
  
  return { message: "Resume deleted successfully" };
};
