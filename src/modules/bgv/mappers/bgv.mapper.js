export class BackgroundVerificationMapper {
  static toDto(bgv) {
    if (!bgv) return null;

    return {
      id: bgv.id,
      companyId: bgv.companyId,
      companyName: bgv.company ? bgv.company.name : null,
      onboardingId: bgv.onboardingId,
      candidateId: bgv.candidateId,
      candidateName: bgv.candidate ? bgv.candidate.name : null,
      candidateEmail: bgv.candidate ? bgv.candidate.email : null,
      assignedHrId: bgv.assignedHrId,
      assignedHrName: bgv.assignedHr ? bgv.assignedHr.name : null,
      status: bgv.status,
      overallResult: bgv.overallResult,
      startedAt: bgv.startedAt,
      completedAt: bgv.completedAt,
      remarks: bgv.remarks,
      checks: bgv.checks ? bgv.checks.map(BackgroundVerificationMapper.toCheckDto) : [],
      history: bgv.history ? bgv.history.map(BackgroundVerificationMapper.toHistoryDto) : [],
      attachments: bgv.attachments ? bgv.attachments.map(BackgroundVerificationMapper.toAttachmentDto) : [],
      createdAt: bgv.createdAt,
      updatedAt: bgv.updatedAt
    };
  }

  static toCheckDto(c) {
    if (!c) return null;
    return {
      id: c.id,
      type: c.type,
      title: c.title,
      status: c.status,
      providerName: c.providerName,
      externalReferenceId: c.externalReferenceId,
      verifiedById: c.verifiedById,
      verifiedByName: c.verifiedBy ? c.verifiedBy.name : null,
      verifiedAt: c.verifiedAt,
      resultData: c.resultData,
      remarks: c.remarks,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  }

  static toHistoryDto(h) {
    if (!h) return null;
    return {
      id: h.id,
      performedById: h.performedById,
      performedByName: h.performedBy ? h.performedBy.name : null,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      action: h.action,
      remarks: h.remarks,
      createdAt: h.createdAt
    };
  }

  static toAttachmentDto(a) {
    if (!a) return null;
    return {
      id: a.id,
      checkId: a.checkId,
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
      uploadedById: a.uploadedById,
      uploadedByName: a.uploadedBy ? a.uploadedBy.name : null,
      createdAt: a.createdAt
    };
  }
}
