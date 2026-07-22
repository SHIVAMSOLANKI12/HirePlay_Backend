import { InterviewSessionRepository } from "../repositories/interviewSession.repository.js";
import { InterviewSessionMapper } from "../mappers/interviewSession.mapper.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import AppError from "../../../utils/AppError.js";

const getCompanyId = async (user) => {
  let companyId = user.companyId;
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) companyId = existingCompany.id;
  }
  if (!companyId) throw new AppError("Company not found", 404);
  return companyId;
};

export const addInterviewNoteWorkflow = async (sessionId, noteData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);

  const note = await InterviewSessionRepository.addNote(
    sessionId,
    user.id,
    noteData.noteText,
    noteData.isPrivate || false,
    noteData.isPinned || false
  );

  await InterviewSessionRepository.addTimelineEvent(
    sessionId,
    "NOTE_ADDED",
    `Note added by ${user.name || user.email}`,
    { noteId: note.id, isPrivate: note.isPrivate }
  );

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { noteId: note.id },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toNoteDto(note);
};

export const getInterviewNotesWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);

  return existing.notes.map(InterviewSessionMapper.toNoteDto);
};

