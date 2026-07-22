import { InterviewScorecardRepository } from "../repositories/interviewScorecard.repository.js";
import { InterviewScorecardMapper } from "../mappers/interviewScorecard.mapper.js";
import { EvaluationEngine } from "../engine/scoring/EvaluationEngine.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { InterviewSessionRepository } from "../../interviewSession/repositories/interviewSession.repository.js";
import prisma from "../../../config/prisma.js";
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

export const createScorecardWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  if (!data.sessionId) throw new AppError("sessionId is required", 400);

  const session = await InterviewSessionRepository.findById(data.sessionId, companyId);
  if (!session) throw new AppError("Interview session not found", 404);

  let candidateId = data.candidateId;
  let candidateUser = candidateId ? await prisma.user.findUnique({ where: { id: candidateId } }) : null;

  if (!candidateUser) {
    if (session.interview?.candidateId) {
      candidateId = session.interview.candidateId;
      candidateUser = await prisma.user.findUnique({ where: { id: candidateId } });
    }

    if (!candidateUser && session.participants) {
      const candidateParticipant = session.participants.find(p => p.role === "CANDIDATE" && p.userId);
      if (candidateParticipant?.userId) {
        candidateId = candidateParticipant.userId;
        candidateUser = await prisma.user.findUnique({ where: { id: candidateId } });
      }
    }
  }

  if (!candidateUser) {
    throw new AppError("Invalid candidateId. Candidate user does not exist in User table.", 400);
  }

  const scorecard = await InterviewScorecardRepository.create({
    ...data,
    companyId,
    candidateId,
    interviewerId: user.id
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: scorecard.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { title: scorecard.title, sessionId: scorecard.sessionId },
    performedByRole: user.role
  });

  return InterviewScorecardMapper.toDto(scorecard);
};

export const getScorecardsWorkflow = async (filters, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await InterviewScorecardRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(InterviewScorecardMapper.toDto)
  };
};

export const getScorecardByIdWorkflow = async (scorecardId, user) => {
  const companyId = await getCompanyId(user);

  const scorecard = await InterviewScorecardRepository.findById(scorecardId, companyId);
  if (!scorecard) throw new AppError("Scorecard not found", 404);

  return InterviewScorecardMapper.toDto(scorecard);
};

export const updateScorecardWorkflow = async (scorecardId, updateData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewScorecardRepository.findById(scorecardId, companyId);
  if (!existing) throw new AppError("Scorecard not found", 404);

  if (existing.status !== "DRAFT") {
    throw new AppError(`Cannot update scorecard in ${existing.status} status. Only DRAFT scorecards can be edited.`, 400);
  }

  await InterviewScorecardRepository.update(scorecardId, companyId, updateData);
  const updated = await InterviewScorecardRepository.findById(scorecardId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: scorecardId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { scorecardId },
    performedByRole: user.role
  });

  return InterviewScorecardMapper.toDto(updated);
};

export const submitScorecardWorkflow = async (scorecardId, submitData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewScorecardRepository.findById(scorecardId, companyId);
  if (!existing) throw new AppError("Scorecard not found", 404);

  if (existing.status === "SUBMITTED" || existing.status === "LOCKED") {
    throw new AppError("Scorecard is already submitted and locked.", 400);
  }

  // Calculate weighted overall score
  const overallScore = EvaluationEngine.calculateScorecardWeightedScore(existing.scores);
  const submittedAt = new Date();

  await InterviewScorecardRepository.updateStatus(scorecardId, companyId, "SUBMITTED", {
    overallScore,
    recommendation: submitData.recommendation || existing.recommendation || "BORDERLINE",
    recommendationReason: submitData.recommendationReason || existing.recommendationReason || null,
    submittedAt
  });

  const updated = await InterviewScorecardRepository.findById(scorecardId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: scorecardId,
    action: ACTIVITY_ACTIONS.SUBMIT,
    metadata: { overallScore, recommendation: updated.recommendation },
    performedByRole: user.role
  });

  return InterviewScorecardMapper.toDto(updated);
};

export const reopenScorecardWorkflow = async (scorecardId, user) => {
  const companyId = await getCompanyId(user);

  if (user.role !== "COMPANY_ADMIN") {
    throw new AppError("Only COMPANY_ADMIN can reopen a submitted scorecard", 403);
  }

  const existing = await InterviewScorecardRepository.findById(scorecardId, companyId);
  if (!existing) throw new AppError("Scorecard not found", 404);

  const reopenedAt = new Date();
  await InterviewScorecardRepository.updateStatus(scorecardId, companyId, "DRAFT", { reopenedAt });

  const updated = await InterviewScorecardRepository.findById(scorecardId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: scorecardId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "REOPEN_SCORECARD" },
    performedByRole: user.role
  });

  return InterviewScorecardMapper.toDto(updated);
};
