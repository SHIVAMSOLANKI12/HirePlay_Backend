import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createInterviewSessionWorkflow,
  getInterviewSessionsWorkflow,
  getInterviewSessionByIdWorkflow,
  updateInterviewSessionWorkflow,
  startInterviewSessionWorkflow,
  pauseInterviewSessionWorkflow,
  resumeInterviewSessionWorkflow,
  completeInterviewSessionWorkflow,
  cancelInterviewSessionWorkflow,
  getSessionTimelineWorkflow
} from "../workflows/interviewSession.workflow.js";
import { addInterviewNoteWorkflow, getInterviewNotesWorkflow } from "../workflows/interviewNote.workflow.js";

export const createInterviewSession = asyncHandler(async (req, res) => {
  const session = await createInterviewSessionWorkflow(req.body, req.user);
  successResponse(res, session, "Interview session created and scheduled successfully", 201);
});

export const getInterviewSessions = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;
  const result = await getInterviewSessionsWorkflow(
    { status, search },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Interview sessions retrieved successfully");
});

export const getInterviewSessionById = asyncHandler(async (req, res) => {
  const session = await getInterviewSessionByIdWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Interview session details retrieved successfully");
});

export const updateInterviewSession = asyncHandler(async (req, res) => {
  const session = await updateInterviewSessionWorkflow(req.params.sessionId, req.body, req.user);
  successResponse(res, session, "Interview session updated successfully");
});

export const startInterviewSession = asyncHandler(async (req, res) => {
  const session = await startInterviewSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Interview session started successfully");
});

export const pauseInterviewSession = asyncHandler(async (req, res) => {
  const session = await pauseInterviewSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Interview session paused successfully");
});

export const resumeInterviewSession = asyncHandler(async (req, res) => {
  const session = await resumeInterviewSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Interview session resumed successfully");
});

export const completeInterviewSession = asyncHandler(async (req, res) => {
  const session = await completeInterviewSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Interview session completed successfully");
});

export const cancelInterviewSession = asyncHandler(async (req, res) => {
  const session = await cancelInterviewSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Interview session cancelled successfully");
});

export const addInterviewNote = asyncHandler(async (req, res) => {
  const note = await addInterviewNoteWorkflow(req.params.sessionId, req.body, req.user);
  successResponse(res, note, "Interview note added successfully", 201);
});

export const getInterviewNotes = asyncHandler(async (req, res) => {
  const notes = await getInterviewNotesWorkflow(req.params.sessionId, req.user);
  successResponse(res, notes, "Interview notes retrieved successfully");
});

export const getSessionTimeline = asyncHandler(async (req, res) => {
  const timeline = await getSessionTimelineWorkflow(req.params.sessionId, req.user);
  successResponse(res, timeline, "Interview session timeline retrieved successfully");
});
