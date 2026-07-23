export class EmployeeDocumentMapper {
  static toDto(doc) {
    if (!doc) return null;

    return {
      id: doc.id,
      companyId: doc.companyId,
      companyName: doc.company ? doc.company.name : null,
      onboardingId: doc.onboardingId,
      candidateId: doc.candidateId,
      candidateName: doc.candidate ? doc.candidate.name : null,
      candidateEmail: doc.candidate ? doc.candidate.email : null,
      templateId: doc.templateId,
      templateTitle: doc.template ? doc.template.title : null,
      documentType: doc.documentType,
      title: doc.title,
      status: doc.status,
      currentVersion: doc.currentVersion,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      expiryDate: doc.expiryDate,
      remarks: doc.remarks,
      verifiedById: doc.verifiedById,
      verifiedByName: doc.verifiedBy ? doc.verifiedBy.name : null,
      verifiedAt: doc.verifiedAt,
      versions: doc.versions ? doc.versions.map(EmployeeDocumentMapper.toVersionDto) : [],
      verifications: doc.verifications ? doc.verifications.map(EmployeeDocumentMapper.toVerificationDto) : [],
      approvalHistories: doc.approvalHistories ? doc.approvalHistories.map(EmployeeDocumentMapper.toApprovalHistoryDto) : [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  static toVersionDto(v) {
    if (!v) return null;
    return {
      id: v.id,
      versionNumber: v.versionNumber,
      fileUrl: v.fileUrl,
      fileName: v.fileName,
      mimeType: v.mimeType,
      fileSize: v.fileSize,
      uploadedById: v.uploadedById,
      uploadedByName: v.uploadedBy ? v.uploadedBy.name : null,
      changeReason: v.changeReason,
      createdAt: v.createdAt
    };
  }

  static toVerificationDto(v) {
    if (!v) return null;
    return {
      id: v.id,
      versionNumber: v.versionNumber,
      action: v.action,
      verifiedById: v.verifiedById,
      verifiedByName: v.verifiedBy ? v.verifiedBy.name : null,
      remarks: v.remarks,
      createdAt: v.createdAt
    };
  }

  static toApprovalHistoryDto(h) {
    if (!h) return null;
    return {
      id: h.id,
      performedById: h.performedById,
      performedByName: h.performedBy ? h.performedBy.name : null,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      remarks: h.remarks,
      createdAt: h.createdAt
    };
  }
}
