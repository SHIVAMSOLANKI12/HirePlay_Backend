import AppError from "../../../utils/AppError.js";
import { findApplicationNoteById, updateApplicationNote } from "../repositories/applicationNote.repository.js";
import { findApplicationById } from "../repositories/application.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { toApplicationNote } from "../../shared/mappers/applicationNote.mapper.js";

export const updateApplicationNoteService = async (user, noteId, noteContent) => {
  // 1. Fetch Note
  const existingNote = await findApplicationNoteById(noteId);
  if (!existingNote) {
    throw new AppError("Note not found", 404);
  }

  // 2. Authorize
  if (user.role !== "COMPANY_ADMIN" && existingNote.authorId !== user.id) {
    throw new AppError("You do not have permission to edit this note", 403);
  }

  // 3. Verify Recruiter Access to the Application's Job (ensures they are in the same company)
  const application = await findApplicationById(existingNote.applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  await verifyRecruiterJobAccess(user, application.jobId);

  // 4. Update Note
  const updatedNote = await updateApplicationNote(noteId, noteContent);

  // 5. Map and return
  return toApplicationNote(updatedNote);
};
