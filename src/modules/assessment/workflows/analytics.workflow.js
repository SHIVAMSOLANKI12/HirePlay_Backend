import prisma from "../../../config/prisma.js";
import AppError from "../../../utils/AppError.js";
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

const validateOwnership = async (assessmentId, user) => {
  const companyId = await getCompanyId(user);
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new AppError("Assessment not found", 404);
  if (assessment.companyId !== companyId) throw new AppError("Forbidden: Access denied to this assessment", 403);
  return { assessment, companyId };
};

/**
 * Calculates comprehensive analytics for an assessment.
 */
export const getAssessmentAnalyticsWorkflow = async (assessmentId, user) => {
  const { companyId } = await validateOwnership(assessmentId, user);

  const [attempts, games, behaviours] = await Promise.all([
    prisma.assessmentAttempt.findMany({
      where: { assessmentId },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        sessions: { select: { cheatRiskLevel: true, cheatRiskScore: true } }
      }
    }),
    prisma.assessmentGame.findMany({ where: { assessmentId } }),
    prisma.assessmentBehaviour.findMany({ where: { assessmentId } })
  ]);

  const completedAttempts = attempts.filter(a => a.status === "COMPLETED" && a.score !== null);
  const totalCompleted = completedAttempts.length;

  // Averages
  const avgScore = totalCompleted > 0 ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / totalCompleted : 0;
  const avgAccuracy = totalCompleted > 0 ? completedAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalCompleted : 0;
  const avgEfficiency = totalCompleted > 0 ? completedAttempts.reduce((sum, a) => sum + (a.efficiency || 0), 0) / totalCompleted : 0;
  
  const completionTimes = completedAttempts
    .filter(a => a.completedAt && a.startedAt)
    .map(a => (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / 1000);
  
  const avgCompletionTimeSec = completionTimes.length > 0
    ? completionTimes.reduce((sum, t) => sum + t, 0) / completionTimes.length
    : 0;

  // Top 10 Candidates
  const topCandidates = [...completedAttempts]
    .sort((a, b) => (b.rank && a.rank) ? a.rank - b.rank : (b.score || 0) - (a.score || 0))
    .slice(0, 10)
    .map(a => ({
      candidateId: a.candidateId,
      name: a.candidate?.name || "Unknown",
      email: a.candidate?.email || "",
      score: a.score,
      accuracy: a.accuracy,
      efficiency: a.efficiency,
      recommendation: a.recommendation,
      rank: a.rank
    }));

  // Score Distribution Histogram (5 buckets)
  const scoreDistribution = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "61-80": 0,
    "81-100": 0
  };

  completedAttempts.forEach(a => {
    const s = a.score || 0;
    if (s <= 20) scoreDistribution["0-20"]++;
    else if (s <= 40) scoreDistribution["21-40"]++;
    else if (s <= 60) scoreDistribution["41-60"]++;
    else if (s <= 80) scoreDistribution["61-80"]++;
    else scoreDistribution["81-100"]++;
  });

  // Difficulty Analysis
  const difficultyAnalysis = games.map(g => ({
    gameId: g.id,
    gameType: g.gameType,
    difficulty: g.difficulty,
    timeLimitMs: g.timeLimitMs
  }));

  // Cheat Risk Distribution
  const cheatRiskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  attempts.forEach(a => {
    a.sessions.forEach(s => {
      if (cheatRiskDistribution[s.cheatRiskLevel] !== undefined) {
        cheatRiskDistribution[s.cheatRiskLevel]++;
      }
    });
  });

  // Average Behaviour Profile Across Assessment
  const behaviourAverages = {
    thinkingSpeed: 0,
    decisionQuality: 0,
    problemSolving: 0,
    planningAbility: 0,
    consistency: 0,
    riskTaking: 0,
    accuracy: 0,
    learningPattern: 0,
    stressIndicator: 0,
    confidenceIndicator: 0
  };

  if (behaviours.length > 0) {
    Object.keys(behaviourAverages).forEach(key => {
      const sum = behaviours.reduce((acc, b) => acc + (b[key] || 0), 0);
      behaviourAverages[key] = parseFloat((sum / behaviours.length).toFixed(2));
    });
  }

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: assessmentId,
    action: ACTIVITY_ACTIONS.VIEW,
    metadata: { viewType: "ANALYTICS_DASHBOARD" },
    performedByRole: user.role
  });

  return {
    summary: {
      totalCandidates: attempts.length,
      totalCompleted,
      averageScore: parseFloat(avgScore.toFixed(2)),
      averageAccuracy: parseFloat(avgAccuracy.toFixed(2)),
      averageEfficiency: parseFloat(avgEfficiency.toFixed(2)),
      averageCompletionTimeSec: parseFloat(avgCompletionTimeSec.toFixed(2))
    },
    topCandidates,
    scoreDistribution,
    difficultyAnalysis,
    cheatRiskDistribution,
    behaviourAverages
  };
};

/**
 * Returns aggregated trait summary across all candidate behavioural profiles.
 */
export const getAssessmentBehaviourSummaryWorkflow = async (assessmentId, user) => {
  const { companyId } = await validateOwnership(assessmentId, user);

  const behaviours = await prisma.assessmentBehaviour.findMany({
    where: { assessmentId }
  });

  const traitCounts = {};
  let totalTraitsAssigned = 0;

  behaviours.forEach(b => {
    const summary = Array.isArray(b.behaviourSummary) ? b.behaviourSummary : [];
    summary.forEach(trait => {
      traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      totalTraitsAssigned++;
    });
  });

  const totalCandidatesAnalyzed = behaviours.length;
  const traitBreakdown = Object.keys(traitCounts).map(trait => ({
    trait,
    count: traitCounts[trait],
    percentage: totalCandidatesAnalyzed > 0 
      ? parseFloat(((traitCounts[trait] / totalCandidatesAnalyzed) * 100).toFixed(2)) 
      : 0
  }));

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: assessmentId,
    action: ACTIVITY_ACTIONS.VIEW,
    metadata: { viewType: "BEHAVIOUR_SUMMARY" },
    performedByRole: user.role
  });

  return {
    totalCandidatesAnalyzed,
    traitBreakdown
  };
};
