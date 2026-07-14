import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findApplicationById } from "../repositories/application.repository.js";
import { createApplicationNote } from "../repositories/applicationNote.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { toApplicationNote } from "../../shared/mappers/applicationNote.mapper.js";

export const createApplicationNoteWorkflow = async (user, applicationId, noteContent) => {
  // 1. Fetch Application
  const application = await findApplicationById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Recruiter Access
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Start Transaction
  const createdNote = await prisma.$transaction(async (tx) => {
    // 3a. Create Note
    const newNote = await createApplicationNote(
      {
        applicationId,
        authorId: user.id,
        note: noteContent,
      },
      tx
    );

    // 3b. Log Activity
    await logApplicationActivity(
      {
        applicationId,
        performedBy: user.id,
        action: "NOTE_ADDED",
        metadata: {
          noteId: newNote.id,
          message: "Recruiter added a private note",
        },
      },
      tx
    );

    return newNote;
  });

  return toApplicationNote(createdNote);
};
