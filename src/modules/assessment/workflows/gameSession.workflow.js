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
