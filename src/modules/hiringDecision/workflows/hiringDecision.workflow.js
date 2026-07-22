import { HiringDecisionRepository } from "../repositories/hiringDecision.repository.js";
import { HiringDecisionMapper } from "../mappers/hiringDecision.mapper.js";
import { DecisionEngine } from "../engine/DecisionEngine.js";
import { InterviewScorecardRepository } from "../../interviewScorecard/repositories/interviewScorecard.repository.js";
import { InterviewAIRepository } from "../../interviewAI/repositories/interviewAI.repository.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import prisma from "../../../config/prisma.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import AppError from "../../../utils/AppError.js";

const getCompanyId = async (user) => {
  let companyId = user.companyId;
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) companyId = existingCompany.id;
  }
  if (!companyId) throw new AppError("Company not found", 404);
  return companyId;
};

export const createHiringDecisionWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  if (!data.applicationId) throw new AppError("applicationId is required", 400);

  const application = await prisma.application.findUnique({ where: { id: data.applicationId } });
  if (!application) throw new AppError("Application not found", 404);

  let candidateId = data.candidateId || application.candidateId;
  let candidateUser = await prisma.user.findUnique({ where: { id: candidateId } });
  if (!candidateUser) {
    throw new AppError("Invalid candidateId. Candidate user does not exist in User table.", 400);
  }

  // Fetch aggregated scorecards & AI Analysis if sessionId provided
  let scorecards = [];
  let aiAnalysis = null;
  if (data.sessionId) {
    scorecards = await InterviewScorecardRepository.findBySessionId(data.sessionId, companyId);
    aiAnalysis = await InterviewAIRepository.getLatestAnalysisBySessionId(data.sessionId, companyId);
  }

  const aggregatedMetrics = DecisionEngine.aggregateDecisionInputs(scorecards, aiAnalysis, application);

  const decision = await HiringDecisionRepository.create({
    companyId,
    applicationId: data.applicationId,
    sessionId: data.sessionId || null,
    candidateId,
    createdById: user.id,
    decisionType: data.decisionType || aggregatedMetrics.suggestedDecisionType || "HIRE",
    status: "PENDING",
    reason: data.reason || `Hiring decision created based on cumulative overall score of ${aggregatedMetrics.overallScore}%.`,
    overallScore: aggregatedMetrics.overallScore,
    aiRecommendation: aggregatedMetrics.aiRecommendation
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decision.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { decisionType: decision.decisionType, applicationId: decision.applicationId },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.HIRING_DECISION_CREATED, {
    decisionId: decision.id,
    companyId,
    applicationId: decision.applicationId,
    candidateId: decision.candidateId,
    decisionType: decision.decisionType,
    status: decision.status
  });

  return HiringDecisionMapper.toDto(decision);
};

export const getHiringDecisionsWorkflow = async (filters, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await HiringDecisionRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(HiringDecisionMapper.toDto)
  };
};

export const getHiringDecisionByIdWorkflow = async (decisionId, user) => {
  const companyId = await getCompanyId(user);

  const decision = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!decision) throw new AppError("Hiring decision not found", 404);

  return HiringDecisionMapper.toDto(decision);
};

export const updateHiringDecisionWorkflow = async (decisionId, updateData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  if (existing.status !== "PENDING" && existing.status !== "UNDER_REVIEW") {
    throw new AppError(`Cannot update decision in ${existing.status} status. Only PENDING or UNDER_REVIEW decisions can be edited.`, 400);
  }

  await HiringDecisionRepository.update(decisionId, companyId, updateData, user.id);
  const updated = await HiringDecisionRepository.findById(decisionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { decisionId, updateData },
    performedByRole: user.role
  });

  return HiringDecisionMapper.toDto(updated);
};

export const reopenHiringDecisionWorkflow = async (decisionId, user) => {
  const companyId = await getCompanyId(user);

  if (user.role !== "COMPANY_ADMIN") {
    throw new AppError("Only COMPANY_ADMIN can reopen a closed or rejected hiring decision", 403);
  }

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  await HiringDecisionRepository.updateStatusAndRecordHistory(
    decisionId,
    companyId,
    existing.status,
    "PENDING",
    "REOPENED",
    user.id,
    "Hiring decision reopened by Admin"
  );

  const updated = await HiringDecisionRepository.findById(decisionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "REOPEN_DECISION" },
    performedByRole: user.role
  });

  return HiringDecisionMapper.toDto(updated);
};

export const addDecisionCommentWorkflow = async (decisionId, commentData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  const comment = await HiringDecisionRepository.addComment(
    decisionId,
    user.id,
    commentData.comment,
    commentData.isPrivate || false
  );

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "ADD_DECISION_COMMENT" },
    performedByRole: user.role
  });

  return HiringDecisionMapper.toCommentDto(comment);
};

export const getDecisionHistoryWorkflow = async (decisionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  const history = await HiringDecisionRepository.getHistory(decisionId);
  return history.map(HiringDecisionMapper.toHistoryDto);
};
