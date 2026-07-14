import AppError from "../../../utils/AppError.js";
import { findApplicationNoteById, deleteApplicationNote } from "../repositories/applicationNote.repository.js";
import { findApplicationById } from "../repositories/application.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const deleteApplicationNoteService = async (user, noteId) => {
  // 1. Fetch Note
  const existingNote = await findApplicationNoteById(noteId);
  if (!existingNote) {
    throw new AppError("Note not found", 404);
  }

  // 2. Authorize
  if (user.role !== "COMPANY_ADMIN" && existingNote.authorId !== user.id) {
    throw new AppError("You do not have permission to delete this note", 403);
  }

  // 3. Verify Recruiter Access to the Application's Job
  const application = await findApplicationById(existingNote.applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  await verifyRecruiterJobAccess(user, application.jobId);

  // 4. Delete Note
  await deleteApplicationNote(noteId);
};
