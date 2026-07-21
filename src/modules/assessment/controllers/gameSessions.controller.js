import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  startSessionWorkflow,
  submitSessionWorkflow,
  pauseSessionWorkflow,
  resumeSessionWorkflow,
  moveSessionWorkflow,
  cheatEventWorkflow,
  getSessionWorkflow
} from "../workflows/gameSession.workflow.js";

export const startSession = asyncHandler(async (req, res) => {
  // Assuming candidate knows their sessionId (from when puzzle was generated/assigned)
  const session = await startSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Game session started successfully", 200);
});

export const submitSession = asyncHandler(async (req, res) => {
  const session = await submitSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Game session submitted successfully", 200);
});

export const pauseSession = asyncHandler(async (req, res) => {
  const session = await pauseSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Game session paused successfully", 200);
});

export const resumeSession = asyncHandler(async (req, res) => {
  const session = await resumeSessionWorkflow(req.params.sessionId, req.user);
  successResponse(res, session, "Game session resumed successfully", 200);
});

export const submitMove = asyncHandler(async (req, res) => {
  const { moveNumber, action, coordinates, moveDurationMs, metadata } = req.body;
  if (moveNumber === undefined || !action) {
    return res.status(400).json({ success: false, message: "moveNumber and action are required" });
  }

  const move = await moveSessionWorkflow(req.params.sessionId, req.body, req.user);
  successResponse(res, move, "Move submitted successfully", 201);
});

export const logCheatEvent = asyncHandler(async (req, res) => {
  const { eventType, metadata } = req.body;
  if (!eventType) {
    return res.status(400).json({ success: false, message: "eventType is required" });
  }

  const session = await cheatEventWorkflow(req.params.sessionId, req.body, req.user);
  successResponse(res, { cheatRiskScore: session.cheatRiskScore, status: session.status }, "Cheat event logged successfully", 201);
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await getSessionWorkflow(req.params.sessionId, req.user);
  // Optional: Apply a mapper to clean the data if necessary, but this is a purely candidate view
  // and we don't return the hidden solution here anyway because it's only in the seed.
  // Wait, if session.seed is included, we might leak the hidden solution!
  // I should ensure the session response strips the seed's hidden solution.
  if (session.seed) {
    delete session.seed.hiddenSolution;
  }
  
  successResponse(res, session, "Session retrieved successfully", 200);
});
