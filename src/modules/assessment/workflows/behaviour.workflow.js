import prisma from "../../../config/prisma.js";
import AppError from "../../../utils/AppError.js";
import { BehaviourAnalysisFactory } from "../engine/behaviour/BehaviourAnalysisFactory.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";

const getCompanyId = async (user) => {
  let companyId = user.companyId;
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }
  if (!companyId) {
    throw new AppError("Company not found", 404);
  }
  return companyId;
};

/**
 * Generates and saves behavioural profile for a completed assessment attempt.
 */
export const generateBehaviourAnalysisWorkflow = async (attemptId) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      sessions: {
        include: {
          moves: true,
          seed: true
        }
      },
      results: true,
      assessment: true
    }
  });

  if (!attempt) return null;

  // Aggregate all moves and session contexts
  const allMoves = attempt.sessions.flatMap(s => s.moves);
  const primarySession = attempt.sessions[0] || {};
  const primaryResult = attempt.results[0] || {};

  const timeTakenMs = attempt.completedAt && attempt.startedAt 
    ? new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime() 
    : 0;

  const sessionContext = {
    timeTakenMs,
    cheatRiskScore: primarySession.cheatRiskScore || 0,
    pauseCount: primarySession.pauseCount || 0,
    idleTimeMs: primarySession.idleTimeMs || 0
  };

  const scoreResult = {
    score: attempt.score || primaryResult.score || 0,
    maxScore: primaryResult.maxScore || 100,
    accuracy: attempt.accuracy || primaryResult.accuracy || 100,
    efficiency: attempt.efficiency || primaryResult.efficiency || 100,
    decisionSpeed: attempt.decisionSpeed || primaryResult.decisionSpeed || 0
  };

  const provider = BehaviourAnalysisFactory.getProvider("RULE_BASED");
  const analysis = await provider.analyze({
    moves: allMoves,
    sessionContext,
    scoreResult,
    seedData: primarySession.seed?.seedData || {}
  });

  const behaviour = await prisma.assessmentBehaviour.upsert({
    where: { attemptId },
    create: {
      attemptId,
      assessmentId: attempt.assessmentId,
      candidateId: attempt.candidateId,
      thinkingSpeed: analysis.thinkingSpeed,
      decisionQuality: analysis.decisionQuality,
      problemSolving: analysis.problemSolving,
      planningAbility: analysis.planningAbility,
      consistency: analysis.consistency,
      riskTaking: analysis.riskTaking,
      accuracy: analysis.accuracy,
      learningPattern: analysis.learningPattern,
      stressIndicator: analysis.stressIndicator,
      confidenceIndicator: analysis.confidenceIndicator,
      behaviourSummary: analysis.behaviourSummary,
      metrics: analysis.metrics,
      analysisVersion: "v1.0",
      analysisProvider: "RULE_BASED"
    },
    update: {
      thinkingSpeed: analysis.thinkingSpeed,
      decisionQuality: analysis.decisionQuality,
      problemSolving: analysis.problemSolving,
      planningAbility: analysis.planningAbility,
      consistency: analysis.consistency,
      riskTaking: analysis.riskTaking,
      accuracy: analysis.accuracy,
      learningPattern: analysis.learningPattern,
      stressIndicator: analysis.stressIndicator,
      confidenceIndicator: analysis.confidenceIndicator,
      behaviourSummary: analysis.behaviourSummary,
      metrics: analysis.metrics,
      updatedAt: new Date()
    }
  });

  await logActivity({
    companyId: attempt.assessment.companyId,
    userId: attempt.candidateId,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: attempt.assessmentId,
    action: ACTIVITY_ACTIONS.GENERATE,
    metadata: { attemptId, behaviourId: behaviour.id },
    performedByRole: "CANDIDATE"
  });

  return behaviour;
};

/**
 * Retrieves behavioural profile for a given result.
 */
export const getResultBehaviourWorkflow = async (resultId, user) => {
  const result = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      attempt: {
        include: {
          assessment: true,
          candidate: { select: { id: true, name: true, email: true } },
          behaviour: true
        }
      }
    }
  });

  if (!result) {
    throw new AppError("Result not found", 404);
  }

  // Access Control: Candidate can only view their own; HR/Admin must belong to the company
  if (user.role === "CANDIDATE" && result.attempt.candidateId !== user.id) {
    throw new AppError("Forbidden: You can only view your own behaviour profile", 403);
  }

  if (user.role !== "CANDIDATE") {
    const companyId = await getCompanyId(user);
    if (result.attempt.assessment.companyId !== companyId) {
      throw new AppError("Forbidden: Unauthorized access to this assessment result", 403);
    }
  }

  let behaviour = result.attempt.behaviour;
  if (!behaviour) {
    // If not pre-generated, generate on the fly
    behaviour = await generateBehaviourAnalysisWorkflow(result.attemptId);
  }

  await logActivity({
    companyId: result.attempt.assessment.companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: result.attempt.assessmentId,
    action: ACTIVITY_ACTIONS.VIEW,
    metadata: { viewType: "BEHAVIOUR_REPORT", resultId },
    performedByRole: user.role
  });

  return {
    candidate: result.attempt.candidate,
    score: result.score,
    recommendation: result.recommendation,
    behaviourProfile: behaviour
  };
};
