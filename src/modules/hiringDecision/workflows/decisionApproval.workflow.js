import { HiringDecisionRepository } from "../repositories/hiringDecision.repository.js";
import { HiringDecisionMapper } from "../mappers/hiringDecision.mapper.js";
import { ApprovalEngine } from "../engine/ApprovalEngine.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
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

export const submitDecisionForReviewWorkflow = async (decisionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  const transition = ApprovalEngine.processStateTransition(existing.status, "SUBMIT");

  await HiringDecisionRepository.updateStatusAndRecordHistory(
    decisionId,
    companyId,
    existing.status,
    transition.nextStatus,
    "SUBMITTED_FOR_REVIEW",
    user.id,
    "Decision submitted for approval review"
  );

  const updated = await HiringDecisionRepository.findById(decisionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.SUBMIT,
    metadata: { status: transition.nextStatus },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.HIRING_DECISION_SUBMITTED, {
    decisionId,
    companyId,
    applicationId: updated.applicationId,
    candidateId: updated.candidateId,
    status: transition.nextStatus
  });

  return HiringDecisionMapper.toDto(updated);
};

export const approveDecisionWorkflow = async (decisionId, approvalData = {}, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  // Approval level check
  const totalLevels = user.role === "COMPANY_ADMIN" ? 1 : 2; // COMPANY_ADMIN approves directly to OFFER_READY
  const currentLevel = user.role === "COMPANY_ADMIN" ? 2 : 1;

  const transition = ApprovalEngine.processStateTransition(existing.status, "APPROVE", {
    currentLevel,
    totalLevels
  });

  await HiringDecisionRepository.updateStatusAndRecordHistory(
    decisionId,
    companyId,
    existing.status,
    transition.nextStatus,
    transition.isOfferReady ? "OFFER_READY" : "APPROVED",
    user.id,
    approvalData.comments || `Approved by ${user.role}`
  );

  const updated = await HiringDecisionRepository.findById(decisionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.APPROVE,
    metadata: { status: transition.nextStatus, isOfferReady: transition.isOfferReady },
    performedByRole: user.role
  });

  const eventName = transition.isOfferReady
    ? ACTIVITY_EVENTS.HIRING_DECISION_OFFER_READY
    : ACTIVITY_EVENTS.HIRING_DECISION_APPROVED;

  eventEngine.emit(eventName, {
    decisionId,
    companyId,
    applicationId: updated.applicationId,
    candidateId: updated.candidateId,
    status: transition.nextStatus,
    isOfferReady: transition.isOfferReady
  });

  return HiringDecisionMapper.toDto(updated);
};

export const rejectDecisionWorkflow = async (decisionId, rejectData = {}, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  const transition = ApprovalEngine.processStateTransition(existing.status, "REJECT");

  await HiringDecisionRepository.updateStatusAndRecordHistory(
    decisionId,
    companyId,
    existing.status,
    transition.nextStatus,
    "REJECTED",
    user.id,
    rejectData.reason || `Rejected by ${user.role}`
  );

  const updated = await HiringDecisionRepository.findById(decisionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.REJECT,
    metadata: { status: transition.nextStatus, reason: rejectData.reason },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.HIRING_DECISION_REJECTED, {
    decisionId,
    companyId,
    applicationId: updated.applicationId,
    candidateId: updated.candidateId,
    status: transition.nextStatus
  });

  return HiringDecisionMapper.toDto(updated);
};

export const escalateDecisionWorkflow = async (decisionId, escalateData = {}, user) => {
  const companyId = await getCompanyId(user);

  const existing = await HiringDecisionRepository.findById(decisionId, companyId);
  if (!existing) throw new AppError("Hiring decision not found", 404);

  const transition = ApprovalEngine.processStateTransition(existing.status, "ESCALATE");

  await HiringDecisionRepository.updateStatusAndRecordHistory(
    decisionId,
    companyId,
    existing.status,
    transition.nextStatus,
    "ESCALATED",
    user.id,
    escalateData.notes || `Escalated to Admin review by ${user.role}`
  );

  const updated = await HiringDecisionRepository.findById(decisionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: decisionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "ESCALATE_DECISION", status: transition.nextStatus },
    performedByRole: user.role
  });

  return HiringDecisionMapper.toDto(updated);
};
