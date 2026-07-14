import AppError from "../../../utils/AppError.js";
import { findApplicationById } from "../repositories/application.repository.js";
import { findApplicationNotes } from "../repositories/applicationNote.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { toApplicationNoteList } from "../../shared/mappers/applicationNote.mapper.js";

export const getApplicationNotesService = async (user, applicationId) => {
  // 1. Fetch Application
  const application = await findApplicationById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Recruiter Access
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Fetch notes
  const notes = await findApplicationNotes(applicationId);

  // 4. Map to DTO
  return toApplicationNoteList(notes);
};
