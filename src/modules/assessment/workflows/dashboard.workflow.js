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
    throw new AppError("Company not found. You must belong to a company to perform this action.", 404);
  }
  return companyId;
};

/**
 * Validates that the HR/Company Admin owns the assessment.
 */
const validateAssessmentOwnership = async (assessmentId, user) => {
  const companyId = await getCompanyId(user);
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new AppError("Assessment not found", 404);
  if (assessment.companyId !== companyId) throw new AppError("Unauthorized access to this assessment", 403);
  return { assessment, companyId };
};

export const getAssessmentDashboardWorkflow = async (assessmentId, user) => {
  const { companyId } = await validateAssessmentOwnership(assessmentId, user);

  // 1. Fetch attempts
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { assessmentId }
  });

  // 2. Aggregate Stats
  const totalAssigned = attempts.length;
  const completed = attempts.filter(a => a.status === "COMPLETED").length;
  const inProgress = attempts.filter(a => a.status === "IN_PROGRESS").length;
  const pending = attempts.filter(a => a.status === "NOT_STARTED").length;
  
  const completedAttempts = attempts.filter(a => a.score !== null);
  
  const averageScore = completedAttempts.length 
    ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length 
    : 0;
    
  const highestScore = completedAttempts.length 
    ? Math.max(...completedAttempts.map(a => a.score)) 
    : 0;
    
  const lowestScore = completedAttempts.length 
    ? Math.min(...completedAttempts.map(a => a.score)) 
    : 0;

  // 3. Recommendation Summary
  const recommendationDistribution = completedAttempts.reduce((acc, attempt) => {
    const rec = attempt.recommendation || "UNRATED";
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {});

  // 4. Log Activity
  await logActivity({
    companyId: companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: assessmentId,
    action: ACTIVITY_ACTIONS.VIEW,
    metadata: { viewType: "DASHBOARD" },
    performedByRole: user.role
  });

  return {
    summary: {
      totalAssigned,
      completed,
      inProgress,
      pending
    },
    scores: {
      averageScore: parseFloat(averageScore.toFixed(2)),
      highestScore: parseFloat(highestScore.toFixed(2)),
      lowestScore: parseFloat(lowestScore.toFixed(2))
    },
    recommendationDistribution
  };
};

export const getAssessmentLeaderboardWorkflow = async (assessmentId, user, page = 1, limit = 10) => {
  const { companyId } = await validateAssessmentOwnership(assessmentId, user);

  const skip = (page - 1) * limit;

  const [total, candidates] = await Promise.all([
    prisma.assessmentAttempt.count({ where: { assessmentId, status: "COMPLETED" } }),
    prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: "COMPLETED" },
      orderBy: { rank: "asc" },
      skip,
      take: parseInt(limit),
      include: {
        candidate: {
          select: { id: true, name: true, email: true }
        }
      }
    })
  ]);

  await logActivity({
    companyId: companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: assessmentId,
    action: ACTIVITY_ACTIONS.VIEW,
    metadata: { viewType: "LEADERBOARD", page },
    performedByRole: user.role
  });

  return {
    data: candidates,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getAssessmentResultsWorkflow = async (assessmentId, user, page = 1, limit = 10) => {
  const { companyId } = await validateAssessmentOwnership(assessmentId, user);
  const skip = (page - 1) * limit;

  const [total, results] = await Promise.all([
    prisma.assessmentResult.count({ where: { attempt: { assessmentId } } }),
    prisma.assessmentResult.findMany({
      where: { attempt: { assessmentId } },
      orderBy: { score: "desc" },
      skip,
      take: parseInt(limit),
      include: {
        attempt: {
          include: {
            candidate: {
              select: { id: true, name: true }
            }
          }
        },
        game: {
          select: { gameType: true, difficulty: true }
        }
      }
    })
  ]);

  return {
    data: results,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getResultByIdWorkflow = async (resultId, user) => {
  const result = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      attempt: {
        include: {
          assessment: true,
          candidate: { select: { id: true, name: true, email: true } }
        }
      },
      game: true
    }
  });

  if (!result) throw new AppError("Result not found", 404);

  // Authorization: Only candidate who took it OR company admin/HR who owns it can view
  if (user.role === "CANDIDATE" && result.attempt.candidateId !== user.id) {
    throw new AppError("Unauthorized access to result", 403);
  }
  
  if (user.role !== "CANDIDATE") {
    const companyId = await getCompanyId(user);
    if (result.attempt.assessment.companyId !== companyId) {
      throw new AppError("Unauthorized access to result", 403);
    }
  }

  await logActivity({
    companyId: result.attempt.assessment.companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: result.attempt.assessmentId,
    action: ACTIVITY_ACTIONS.VIEW,
    metadata: { viewType: "RESULT_DETAILS", resultId },
    performedByRole: user.role
  });

  return result;
};
