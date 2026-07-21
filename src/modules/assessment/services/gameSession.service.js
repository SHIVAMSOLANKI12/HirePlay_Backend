import prisma from "../../../config/prisma.js";
import AppError from "../../../utils/AppError.js";
import { sessionEngine } from "../engine/session/GameSessionEngine.js";

export const startGameSession = async (sessionId, candidateId) => {
  return await sessionEngine.startSession(sessionId, candidateId);
};

export const submitGameSession = async (sessionId, candidateId) => {
  return await sessionEngine.submitSession(sessionId, candidateId);
};

export const pauseGameSession = async (sessionId, candidateId) => {
  return await sessionEngine.pauseSession(sessionId, candidateId);
};

export const resumeGameSession = async (sessionId, candidateId) => {
  return await sessionEngine.resumeSession(sessionId, candidateId);
};

export const processGameMove = async (sessionId, candidateId, moveData) => {
  return await sessionEngine.processMove(sessionId, candidateId, moveData);
};

export const logCheatEvent = async (sessionId, candidateId, eventData) => {
  return await sessionEngine.logCheatEvent(sessionId, candidateId, eventData.eventType, eventData.metadata);
};

export const getGameSession = async (sessionId, candidateId) => {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      attempt: true,
      moves: {
        orderBy: { moveNumber: 'asc' }
      }
    }
  });

  if (!session) throw new AppError("Game session not found", 404);
  if (session.attempt.candidateId !== candidateId) throw new AppError("Unauthorized access to session", 403);

  return session;
};
