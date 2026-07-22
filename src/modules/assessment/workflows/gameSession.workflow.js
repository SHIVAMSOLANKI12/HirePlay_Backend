import {
  startGameSession,
  submitGameSession,
  pauseGameSession,
  resumeGameSession,
  processGameMove,
  logCheatEvent,
  getGameSession
} from "../services/gameSession.service.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { RuleBasedScoringProvider } from "../engine/scoring/RuleBasedScoringProvider.js";
import { RecommendationEngine } from "../engine/ranking/RecommendationEngine.js";
import { RankingEngine } from "../engine/ranking/RankingEngine.js";
import { generateBehaviourAnalysisWorkflow } from "./behaviour.workflow.js";
import prisma from "../../../config/prisma.js";

const buildActivityLog = (user, session, action, metadata = {}) => ({
  companyId: user.companyId, // Might be undefined if not in token, but good practice
  userId: user.id,
  entityType: ACTIVITY_ENTITIES.ASSESSMENT,
  entityId: session.attemptId, // Relate to attempt
  action,
  metadata: { sessionId: session.id, ...metadata },
  performedByRole: user.role
});

export const startSessionWorkflow = async (sessionId, user) => {
  const session = await startGameSession(sessionId, user.id);
  await logActivity(buildActivityLog(user, session, ACTIVITY_ACTIONS.START));
  return session;
};

export const submitSessionWorkflow = async (sessionId, user) => {
  const session = await submitGameSession(sessionId, user.id);
  
  // 1. Fetch full session details for scoring
  const fullSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      seed: true,
      moves: true,
      attempt: {
        include: {
          assessment: {
            select: { scoringProfile: true }
          }
        }
      }
    }
  });

  if (fullSession && fullSession.seed) {
    // 2. Score the session
    const scoringProvider = new RuleBasedScoringProvider();
    const timeTakenMs = new Date(fullSession.endedAt).getTime() - new Date(fullSession.startedAt).getTime() - fullSession.idleTimeMs;
    
    const sessionContext = {
      timeTakenMs,
      cheatRiskScore: fullSession.cheatRiskScore,
      pauseCount: fullSession.pauseCount
    };
    
    const scoringProfile = fullSession.attempt?.assessment?.scoringProfile || {};
    
    const resultStats = await scoringProvider.calculateScore(fullSession.seed.seedData, fullSession.moves, sessionContext, scoringProfile);
    const recommendation = RecommendationEngine.evaluate(resultStats.score);

    // 3. Create AssessmentResult
    await prisma.assessmentResult.create({
      data: {
        attemptId: fullSession.attemptId,
        gameId: fullSession.gameId,
        score: resultStats.score,
        maxScore: resultStats.maxScore,
        accuracy: resultStats.accuracy,
        efficiency: resultStats.efficiency,
        decisionSpeed: resultStats.decisionSpeed,
        recommendation,
        scoreBreakdown: resultStats.metadata
      }
    });

    // 4. Update the Attempt aggregate score (simplified: average of all game results)
    const allResults = await prisma.assessmentResult.findMany({ where: { attemptId: fullSession.attemptId } });
    const avgScore = allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length;
    const avgEfficiency = allResults.reduce((sum, r) => sum + (r.efficiency || 0), 0) / allResults.length;
    const avgAccuracy = allResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / allResults.length;
    const avgDecisionSpeed = allResults.reduce((sum, r) => sum + (r.decisionSpeed || 0), 0) / allResults.length;
    
    const finalRecommendation = RecommendationEngine.evaluate(avgScore);
    
    // Check if all games are submitted to mark attempt as COMPLETED
    const allSessions = await prisma.gameSession.findMany({ where: { attemptId: fullSession.attemptId } });
    const allSubmitted = allSessions.every(s => s.status === "SUBMITTED" || s.status === "EXPIRED" || s.status === "CANCELLED");

    await prisma.assessmentAttempt.update({
      where: { id: fullSession.attemptId },
      data: {
        score: avgScore,
        efficiency: avgEfficiency,
        accuracy: avgAccuracy,
        decisionSpeed: avgDecisionSpeed,
        recommendation: finalRecommendation,
        status: allSubmitted ? "COMPLETED" : "IN_PROGRESS",
        completedAt: allSubmitted ? new Date() : null
      }
    });

    // 5. Asynchronously trigger Ranking Engine & Behaviour Analysis Engine
    if (allSubmitted) {
      RankingEngine.recalculateAssessmentRanks(fullSession.attempt.assessmentId).catch(err => {
        console.error("Failed to recalculate ranks:", err);
      });
      generateBehaviourAnalysisWorkflow(fullSession.attemptId).catch(err => {
        console.error("Failed to generate behaviour analysis:", err);
      });
    }
  }

  await logActivity(buildActivityLog(user, session, ACTIVITY_ACTIONS.SUBMIT, { score: session.cheatRiskScore }));
  return session;
};

export const pauseSessionWorkflow = async (sessionId, user) => {
  const session = await pauseGameSession(sessionId, user.id);
  await logActivity(buildActivityLog(user, session, ACTIVITY_ACTIONS.PAUSE));
  return session;
};

export const resumeSessionWorkflow = async (sessionId, user) => {
  const session = await resumeGameSession(sessionId, user.id);
  await logActivity(buildActivityLog(user, session, ACTIVITY_ACTIONS.RESUME));
  return session;
};

export const moveSessionWorkflow = async (sessionId, moveData, user) => {
  const move = await processGameMove(sessionId, user.id, moveData);
  return move; // We don't log every single move to activity feed, it's too noisy
};

export const cheatEventWorkflow = async (sessionId, eventData, user) => {
  const session = await logCheatEvent(sessionId, user.id, eventData);
  
  // Log only significant flags
  if (session.status === "CHEAT_FLAGGED" || eventData.eventType === "MULTIPLE_SESSIONS") {
    await logActivity(buildActivityLog(user, session, ACTIVITY_ACTIONS.FLAG, { 
      eventType: eventData.eventType, 
      riskScore: session.cheatRiskScore 
    }));
  }
  
  return session;
};

export const getSessionWorkflow = async (sessionId, user) => {
  return await getGameSession(sessionId, user.id);
};
