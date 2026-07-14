import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  applicationIdParamsSchema,
  applicationNoteParamsSchema,
  createApplicationNoteSchema,
  updateApplicationNoteSchema,
} from "../validations/applicationNote.validation.js";
import { createApplicationNoteWorkflow } from "../workflows/createApplicationNote.workflow.js";
import { getApplicationNotesService } from "../services/getApplicationNotes.service.js";
import { updateApplicationNoteService } from "../services/updateApplicationNote.service.js";
import { deleteApplicationNoteService } from "../services/deleteApplicationNote.service.js";

export const createApplicationNoteController = asyncHandler(async (req, res) => {
  const { applicationId } = applicationIdParamsSchema.parse(req.params);
  const { note } = createApplicationNoteSchema.parse(req.body);

  const newNote = await createApplicationNoteWorkflow(req.user, applicationId, note);

  return successResponse(res, newNote, "Note added successfully", 201);
});

export const getApplicationNotesController = asyncHandler(async (req, res) => {
  const { applicationId } = applicationIdParamsSchema.parse(req.params);

  const notes = await getApplicationNotesService(req.user, applicationId);

  return successResponse(res, notes, "Notes fetched successfully", 200);
});

export const updateApplicationNoteController = asyncHandler(async (req, res) => {
  const { noteId } = applicationNoteParamsSchema.parse(req.params);
  const { note } = updateApplicationNoteSchema.parse(req.body);

  const updatedNote = await updateApplicationNoteService(req.user, noteId, note);

  return successResponse(res, updatedNote, "Note updated successfully", 200);
});

export const deleteApplicationNoteController = asyncHandler(async (req, res) => {
  const { noteId } = applicationNoteParamsSchema.parse(req.params);

  await deleteApplicationNoteService(req.user, noteId);

  return successResponse(res, null, "Note deleted successfully", 200);
});
