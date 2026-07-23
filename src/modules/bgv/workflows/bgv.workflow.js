import { BackgroundVerificationRepository } from "../repositories/bgv.repository.js";
import { OnboardingRepository } from "../../onboarding/repositories/onboarding.repository.js";
import { EmployeeDocumentRepository } from "../../document/repositories/employeeDocument.repository.js";
import { BackgroundVerificationMapper } from "../mappers/bgv.mapper.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
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

export const createVerificationWorkflow = async (onboardingId, data = {}, user) => {
  const companyId = await getCompanyId(user);

  const onboarding = await OnboardingRepository.findById(onboardingId, companyId);
  if (!onboarding) throw new AppError("Onboarding record not found", 404);

  // Business Rule: Onboarding must be active
  if (onboarding.status === "CANCELLED") {
    throw new AppError("Background verification cannot be created for a cancelled onboarding record.", 400);
  }

  // Business Rule: Mandatory documents approved check (or at least 1 document uploaded/approved)
  const docs = await EmployeeDocumentRepository.findByOnboardingId(onboardingId, companyId);
  if (!docs || docs.length === 0) {
    throw new AppError("Background verification can start only after candidate uploads required onboarding documents.", 400);
  }

  const existing = await BackgroundVerificationRepository.findByOnboardingId(onboardingId, companyId);
  if (existing) {
    return BackgroundVerificationMapper.toDto(existing);
  }

  const defaultChecks = data.checks || [
    { type: "IDENTITY", title: "Passport / Government Photo ID Verification" },
    { type: "ADDRESS", title: "Permanent & Current Address Verification" },
    { type: "EDUCATION", title: "Highest Degree & University Verification" },
    { type: "EMPLOYMENT", title: "Prior Employment & Experience Verification" },
    { type: "CRIMINAL_RECORD", title: "Police & Law Enforcement Background Check" }
  ];

  if (data.assignedHrId) {
    const hrUser = await prisma.user.findFirst({ where: { id: data.assignedHrId, deletedAt: null } });
    if (!hrUser) {
      throw new AppError("Invalid HR User ID provided for assignment. User does not exist.", 400);
    }
  }

  const caseRecord = await BackgroundVerificationRepository.create({
    companyId,
    onboardingId,
    candidateId: onboarding.candidateId,
    assignedHrId: data.assignedHrId || user.id,
    status: "NOT_STARTED",
    remarks: data.remarks || null,
    createdById: user.id,
    defaultChecks
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: onboardingId,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { action: "CREATE_BGV_CASE", verificationId: caseRecord.id },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.BGV_CREATED, {
    verificationId: caseRecord.id,
    onboardingId,
    companyId,
    candidateId: onboarding.candidateId
  });

  return BackgroundVerificationMapper.toDto(caseRecord);
};

export const getVerificationsWorkflow = async (filters = {}, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await BackgroundVerificationRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(BackgroundVerificationMapper.toDto)
  };
};

export const getVerificationByIdWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  return BackgroundVerificationMapper.toDto(bgv);
};

export const updateVerificationWorkflow = async (id, updateData, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  if (updateData.assignedHrId) {
    const hrUser = await prisma.user.findFirst({ where: { id: updateData.assignedHrId, deletedAt: null } });
    if (!hrUser) {
      throw new AppError("Invalid HR User ID provided for assignment. User does not exist.", 400);
    }
    await BackgroundVerificationRepository.updateAssignedHr(id, companyId, updateData.assignedHrId);
  }

  const updated = await BackgroundVerificationRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: bgv.onboardingId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "UPDATE_BGV_CASE", verificationId: id },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.BGV_UPDATED, { verificationId: id, companyId });

  return BackgroundVerificationMapper.toDto(updated);
};

export const startVerificationWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  if (bgv.status !== "NOT_STARTED" && bgv.status !== "PENDING_INFORMATION") {
    throw new AppError(`Cannot start verification case in ${bgv.status} status.`, 400);
  }

  await BackgroundVerificationRepository.updateStatusAndAddHistory(
    id,
    companyId,
    bgv.status,
    "IN_PROGRESS",
    "START",
    user.id,
    "Background verification checks initiated"
  );

  const updated = await BackgroundVerificationRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: bgv.onboardingId,
    action: ACTIVITY_ACTIONS.START,
    metadata: { action: "START_BGV_CASE", status: "IN_PROGRESS" },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.BGV_STARTED, { verificationId: id, companyId });

  return BackgroundVerificationMapper.toDto(updated);
};

export const verifyVerificationWorkflow = async (id, bodyData = {}, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  if (bgv.status === "VERIFIED") {
    throw new AppError("Background verification case is already verified and completed.", 400);
  }

  // Update check if specific checkId passed
  if (bodyData.checkId) {
    await BackgroundVerificationRepository.updateCheckStatus(
      bodyData.checkId,
      "VERIFIED",
      user.id,
      bodyData.remarks || "Check verified successfully"
    );
  }

  const remarks = bodyData.remarks || "All background verification checks completed successfully";

  await BackgroundVerificationRepository.updateStatusAndAddHistory(
    id,
    companyId,
    bgv.status,
    "VERIFIED",
    "VERIFY",
    user.id,
    remarks,
    "PASSED"
  );

  const updated = await BackgroundVerificationRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: bgv.onboardingId,
    action: ACTIVITY_ACTIONS.APPROVE,
    metadata: { action: "VERIFY_BGV_CASE", status: "VERIFIED" },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.BGV_VERIFIED, { verificationId: id, companyId, candidateId: bgv.candidateId });
  eventEngine.emit(ACTIVITY_EVENTS.BGV_COMPLETED, { verificationId: id, companyId, result: "PASSED" });

  return BackgroundVerificationMapper.toDto(updated);
};

export const rejectVerificationWorkflow = async (id, bodyData = {}, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  if (bgv.status === "VERIFIED") {
    throw new AppError("Cannot reject an already verified background case.", 400);
  }

  if (bodyData.checkId) {
    await BackgroundVerificationRepository.updateCheckStatus(
      bodyData.checkId,
      "FAILED",
      user.id,
      bodyData.reason || "Check failed verification"
    );
  }

  const remarks = bodyData.reason || bodyData.remarks || "Discrepancy found during verification check";

  await BackgroundVerificationRepository.updateStatusAndAddHistory(
    id,
    companyId,
    bgv.status,
    "REJECTED",
    "REJECT",
    user.id,
    remarks,
    "FAILED"
  );

  const updated = await BackgroundVerificationRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: bgv.onboardingId,
    action: ACTIVITY_ACTIONS.REJECT,
    metadata: { action: "REJECT_BGV_CASE", status: "REJECTED", reason: remarks },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.BGV_REJECTED, { verificationId: id, companyId, candidateId: bgv.candidateId, remarks });

  return BackgroundVerificationMapper.toDto(updated);
};

export const requestInformationWorkflow = async (id, bodyData = {}, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  const remarks = bodyData.remarks || bodyData.message || "Additional information requested from candidate";

  await BackgroundVerificationRepository.updateStatusAndAddHistory(
    id,
    companyId,
    bgv.status,
    "PENDING_INFORMATION",
    "REQUEST_INFORMATION",
    user.id,
    remarks
  );

  const updated = await BackgroundVerificationRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: bgv.onboardingId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "REQUEST_BGV_INFO", status: "PENDING_INFORMATION", remarks },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.BGV_INFO_REQUESTED, { verificationId: id, companyId, candidateId: bgv.candidateId, remarks });

  return BackgroundVerificationMapper.toDto(updated);
};

export const getVerificationHistoryWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);

  const bgv = await BackgroundVerificationRepository.findById(id, companyId);
  if (!bgv) throw new AppError("Background verification case not found", 404);

  return {
    verificationId: bgv.id,
    status: bgv.status,
    overallResult: bgv.overallResult,
    startedAt: bgv.startedAt,
    completedAt: bgv.completedAt,
    history: bgv.history ? bgv.history.map(BackgroundVerificationMapper.toHistoryDto) : [],
    checks: bgv.checks ? bgv.checks.map(BackgroundVerificationMapper.toCheckDto) : []
  };
};
