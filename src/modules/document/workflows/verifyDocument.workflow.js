import { EmployeeDocumentRepository } from "../repositories/employeeDocument.repository.js";
import { EmployeeDocumentMapper } from "../mappers/employeeDocument.mapper.js";
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

export const approveDocumentWorkflow = async (documentId, remarks = null, user) => {
  const companyId = await getCompanyId(user);

  const existing = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!existing) throw new AppError("Document not found", 404);

  if (existing.status === "APPROVED") {
    throw new AppError("Document is already approved.", 400);
  }

  await EmployeeDocumentRepository.updateStatusAndRecordHistory(
    documentId,
    companyId,
    existing.status,
    "APPROVED",
    user.id,
    remarks || "Document verified and approved",
    "APPROVED"
  );

  const updated = await EmployeeDocumentRepository.findById(documentId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: existing.onboardingId,
    action: ACTIVITY_ACTIONS.APPROVE,
    metadata: { action: "APPROVE_DOCUMENT", documentId, status: "APPROVED" },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.DOCUMENT_APPROVED, {
    documentId,
    companyId,
    candidateId: existing.candidateId
  });

  return EmployeeDocumentMapper.toDto(updated);
};

export const rejectDocumentWorkflow = async (documentId, reason = null, user) => {
  const companyId = await getCompanyId(user);

  const existing = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!existing) throw new AppError("Document not found", 404);

  await EmployeeDocumentRepository.updateStatusAndRecordHistory(
    documentId,
    companyId,
    existing.status,
    "REJECTED",
    user.id,
    reason || "Document rejected during verification",
    "REJECTED"
  );

  const updated = await EmployeeDocumentRepository.findById(documentId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: existing.onboardingId,
    action: ACTIVITY_ACTIONS.REJECT,
    metadata: { action: "REJECT_DOCUMENT", documentId, status: "REJECTED", reason },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.DOCUMENT_REJECTED, {
    documentId,
    companyId,
    candidateId: existing.candidateId,
    reason
  });

  return EmployeeDocumentMapper.toDto(updated);
};

export const requestReuploadWorkflow = async (documentId, remarks = null, user) => {
  const companyId = await getCompanyId(user);

  const existing = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!existing) throw new AppError("Document not found", 404);

  await EmployeeDocumentRepository.updateStatusAndRecordHistory(
    documentId,
    companyId,
    existing.status,
    "REUPLOAD_REQUIRED",
    user.id,
    remarks || "Re-upload requested by HR",
    "REUPLOAD_REQUESTED"
  );

  const updated = await EmployeeDocumentRepository.findById(documentId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: existing.onboardingId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "REQUEST_REUPLOAD_DOCUMENT", documentId, status: "REUPLOAD_REQUIRED", remarks },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.DOCUMENT_REUPLOAD_REQUESTED, {
    documentId,
    companyId,
    candidateId: existing.candidateId,
    remarks
  });

  return EmployeeDocumentMapper.toDto(updated);
};
