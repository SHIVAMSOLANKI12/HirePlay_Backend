import prisma from "../../../../config/prisma.js";
import AppError from "../../../../utils/AppError.js";
import { RuleBasedAntiCheatProvider } from "../anticheat/RuleBasedAntiCheatProvider.js";

/**
 * Game Session Engine
 * Coordinates game states, validates moves against limits, and invokes anti-cheat.
 */
export class GameSessionEngine {
  constructor() {
    this.antiCheat = new RuleBasedAntiCheatProvider();
  }

  async startSession(sessionId, candidateId) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { seed: true }
    });

    if (!session) throw new AppError("Game session not found", 404);
    
    // Authorization: Candidate can only access their own sessions (by attempt mapping)
    const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: session.attemptId } });
    if (!attempt || attempt.candidateId !== candidateId) {
      throw new AppError("Unauthorized access to session", 403);
    }

    if (session.status === "SUBMITTED" || session.status === "EXPIRED" || session.status === "CANCELLED") {
      throw new AppError(`Cannot start session. Current status: ${session.status}`, 400);
    }

    if (session.status === "CREATED" || session.status === "READY") {
      return await prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: "RUNNING", startedAt: new Date() }
      });
    }

    return session;
  }

  async processMove(sessionId, candidateId, moveData) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { seed: true, attempt: true }
    });

    if (!session) throw new AppError("Session not found", 404);
    if (session.attempt.candidateId !== candidateId) throw new AppError("Unauthorized", 403);
    if (session.status !== "RUNNING") throw new AppError(`Cannot make move. Status: ${session.status}`, 400);

    // Validate Time (basic server side check)
    const timeLimit = session.seed?.metadata?.timeLimitMs;
    if (timeLimit) {
      const elapsed = Date.now() - new Date(session.startedAt).getTime() - session.idleTimeMs;
      if (elapsed > timeLimit) {
        await prisma.gameSession.update({ where: { id: sessionId }, data: { status: "EXPIRED" } });
        throw new AppError("Session time limit expired", 400);
      }
    }

    // Server-side Move validation
    // Future: Delegate to GameValidator.interface.js for logic checking.
    // Right now, just store it and ensure sequence integrity.
    
    // Expected next move number
    const lastMove = await prisma.gameMove.findFirst({
      where: { sessionId },
      orderBy: { moveNumber: 'desc' }
    });
    const expectedMoveNumber = lastMove ? lastMove.moveNumber + 1 : 1;

    if (moveData.moveNumber !== expectedMoveNumber) {
      throw new AppError(`Move sequence mismatch. Expected ${expectedMoveNumber}`, 400);
    }

    const move = await prisma.gameMove.create({
      data: {
        sessionId,
        moveNumber: moveData.moveNumber,
        action: moveData.action,
        coordinates: moveData.coordinates || {},
        moveDurationMs: moveData.moveDurationMs || 0,
        metadata: moveData.metadata || {}
      }
    });

    return move;
  }

  async submitSession(sessionId, candidateId) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { attempt: true }
    });

    if (!session) throw new AppError("Session not found", 404);
    if (session.attempt.candidateId !== candidateId) throw new AppError("Unauthorized", 403);

    return await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: "SUBMITTED", submittedAt: new Date(), endedAt: new Date() }
    });
  }

  async pauseSession(sessionId, candidateId) {
    // Validates and updates status to PAUSED, increments pauseCount
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId }, include: { attempt: true }});
    if (!session || session.attempt.candidateId !== candidateId) throw new AppError("Unauthorized", 403);
    if (session.status !== "RUNNING") throw new AppError("Only running sessions can be paused", 400);

    return await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: "PAUSED", pauseCount: { increment: 1 } }
    });
  }

  async resumeSession(sessionId, candidateId) {
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId }, include: { attempt: true }});
    if (!session || session.attempt.candidateId !== candidateId) throw new AppError("Unauthorized", 403);
    if (session.status !== "PAUSED" && session.status !== "CHEAT_FLAGGED") {
      throw new AppError("Only paused or flagged sessions can be resumed", 400);
    }

    return await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: "RUNNING" }
    });
  }

  async logCheatEvent(sessionId, candidateId, eventType, metadata = {}) {
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId }, include: { attempt: true }});
    if (!session || session.attempt.candidateId !== candidateId) throw new AppError("Unauthorized", 403);

    const evaluation = await this.antiCheat.evaluateEvent(session, { eventType, metadata });

    const updates = {
      cheatRiskScore: evaluation.newScore,
      cheatRiskLevel: evaluation.riskLevel
    };

    if (evaluation.flagSession) {
      updates.status = "CHEAT_FLAGGED";
    }

    await prisma.cheatEvent.create({
      data: {
        sessionId,
        eventType,
        metadata
      }
    });

    return await prisma.gameSession.update({
      where: { id: sessionId },
      data: updates
    });
  }
}

export const sessionEngine = new GameSessionEngine();
