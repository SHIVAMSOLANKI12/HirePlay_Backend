import { EmployeeDocumentRepository } from "../repositories/employeeDocument.repository.js";
import { DocumentTemplateRepository } from "../repositories/documentTemplate.repository.js";
import { OnboardingRepository } from "../../onboarding/repositories/onboarding.repository.js";
import { EmployeeDocumentMapper } from "../mappers/employeeDocument.mapper.js";
import { StorageProviderFactory } from "../storage/StorageProviderFactory.js";
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

export const uploadDocumentWorkflow = async (onboardingId, file, bodyData, user) => {
  const companyId = await getCompanyId(user);

  const onboarding = await OnboardingRepository.findById(onboardingId, companyId);
  if (!onboarding) throw new AppError("Onboarding record not found", 404);

  if (!file || (!file.buffer && !file.path)) {
    throw new AppError("Document file is required for upload.", 400);
  }

  const documentType = bodyData.documentType || "OTHER";
  const title = bodyData.title || `${documentType} Document`;

  // Validation against template if available
  const template = await DocumentTemplateRepository.findByType(companyId, documentType);
  if (template) {
    const maxBytes = template.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new AppError(`File size exceeds maximum allowed limit of ${template.maxFileSizeMb}MB`, 400);
    }
    if (template.allowedMimeTypes && Array.isArray(template.allowedMimeTypes)) {
      if (!template.allowedMimeTypes.includes(file.mimetype)) {
        throw new AppError(`Invalid file format. Allowed types: ${template.allowedMimeTypes.join(", ")}`, 400);
      }
    }
  }

  // Upload file via Storage Provider
  const storageProvider = StorageProviderFactory.getProvider();
  const storageResult = await storageProvider.uploadFile(file, "documents");

  const document = await EmployeeDocumentRepository.create({
    companyId,
    onboardingId,
    candidateId: onboarding.candidateId,
    templateId: template ? template.id : null,
    documentType,
    title,
    status: "UPLOADED",
    fileUrl: storageResult.fileUrl,
    fileName: storageResult.fileName,
    mimeType: storageResult.mimeType,
    fileSize: storageResult.fileSize,
    storageKey: storageResult.storageKey,
    expiryDate: bodyData.expiryDate || null,
    remarks: bodyData.remarks || null,
    uploadedById: user.id,
    changeReason: bodyData.changeReason || "Initial Document Upload"
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: onboardingId,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { action: "UPLOAD_DOCUMENT", documentId: document.id, title, documentType },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.DOCUMENT_UPLOADED, {
    documentId: document.id,
    onboardingId,
    companyId,
    candidateId: onboarding.candidateId,
    documentType
  });

  return EmployeeDocumentMapper.toDto(document);
};

export const reuploadDocumentWorkflow = async (documentId, file, bodyData = {}, user) => {
  const companyId = await getCompanyId(user);

  const existing = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!existing) throw new AppError("Document not found", 404);

  // Candidate/User ownership check
  if (user.role === "CANDIDATE" && existing.candidateId !== user.id) {
    throw new AppError("You do not have permission to re-upload this document.", 403);
  }

  if (existing.status === "APPROVED" && user.role === "CANDIDATE") {
    throw new AppError("Approved documents cannot be modified by candidates.", 400);
  }

  if (!file || (!file.buffer && !file.path)) {
    throw new AppError("Replacement file is required for re-upload.", 400);
  }

  const storageProvider = StorageProviderFactory.getProvider();
  const storageResult = await storageProvider.uploadFile(file, "documents");

  await EmployeeDocumentRepository.createNextVersion(documentId, companyId, {
    fileUrl: storageResult.fileUrl,
    fileName: storageResult.fileName,
    mimeType: storageResult.mimeType,
    fileSize: storageResult.fileSize,
    storageKey: storageResult.storageKey,
    uploadedById: user.id,
    changeReason: bodyData.changeReason || `Re-uploaded file for version ${existing.currentVersion + 1}`
  });

  const updated = await EmployeeDocumentRepository.findById(documentId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: existing.onboardingId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "REUPLOAD_DOCUMENT", documentId, newVersion: updated.currentVersion },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.DOCUMENT_UPDATED, {
    documentId,
    companyId,
    versionNumber: updated.currentVersion
  });

  return EmployeeDocumentMapper.toDto(updated);
};

export const getDocumentsByOnboardingWorkflow = async (onboardingId, user) => {
  const companyId = await getCompanyId(user);
  const docs = await EmployeeDocumentRepository.findByOnboardingId(onboardingId, companyId);
  return docs.map(EmployeeDocumentMapper.toDto);
};

export const getDocumentByIdWorkflow = async (documentId, user) => {
  const companyId = await getCompanyId(user);
  const doc = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!doc) throw new AppError("Document not found", 404);
  return EmployeeDocumentMapper.toDto(doc);
};

export const updateDocumentWorkflow = async (documentId, updateData, user) => {
  const companyId = await getCompanyId(user);
  const existing = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!existing) throw new AppError("Document not found", 404);

  await EmployeeDocumentRepository.updateMetadata(documentId, companyId, updateData);
  const updated = await EmployeeDocumentRepository.findById(documentId, companyId);

  return EmployeeDocumentMapper.toDto(updated);
};

export const deleteDocumentWorkflow = async (documentId, user) => {
  const companyId = await getCompanyId(user);
  const existing = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!existing) throw new AppError("Document not found", 404);

  await EmployeeDocumentRepository.softDelete(documentId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: existing.onboardingId,
    action: ACTIVITY_ACTIONS.DELETE,
    metadata: { action: "DELETE_DOCUMENT", documentId },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.DOCUMENT_DELETED, { documentId, companyId });

  return { success: true, message: "Document soft deleted successfully" };
};

export const getDocumentHistoryWorkflow = async (documentId, user) => {
  const companyId = await getCompanyId(user);
  const doc = await EmployeeDocumentRepository.findById(documentId, companyId);
  if (!doc) throw new AppError("Document not found", 404);

  return {
    documentId: doc.id,
    title: doc.title,
    currentVersion: doc.currentVersion,
    versions: doc.versions ? doc.versions.map(EmployeeDocumentMapper.toVersionDto) : [],
    verifications: doc.verifications ? doc.verifications.map(EmployeeDocumentMapper.toVerificationDto) : [],
    approvalHistories: doc.approvalHistories ? doc.approvalHistories.map(EmployeeDocumentMapper.toApprovalHistoryDto) : []
  };
};
