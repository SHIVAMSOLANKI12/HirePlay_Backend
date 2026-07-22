export class HiringDecisionMapper {
  static toDto(decision) {
    if (!decision) return null;

    return {
      id: decision.id,
      companyId: decision.companyId,
      applicationId: decision.applicationId,
      sessionId: decision.sessionId,
      candidateId: decision.candidateId,
      candidateName: decision.candidate ? decision.candidate.name : null,
      createdById: decision.createdById,
      createdByName: decision.createdBy ? decision.createdBy.name : null,
      decisionType: decision.decisionType,
      status: decision.status,
      reason: decision.reason,
      overallScore: decision.overallScore,
      aiRecommendation: decision.aiRecommendation,
      version: decision.version,
      approvals: decision.approvals ? decision.approvals.map(HiringDecisionMapper.toApprovalDto) : [],
      comments: decision.comments ? decision.comments.map(HiringDecisionMapper.toCommentDto) : [],
      history: decision.history ? decision.history.map(HiringDecisionMapper.toHistoryDto) : [],
      audits: decision.audits ? decision.audits.map(HiringDecisionMapper.toAuditDto) : [],
      createdAt: decision.createdAt,
      updatedAt: decision.updatedAt
    };
  }

  static toApprovalDto(approval) {
    if (!approval) return null;
    return {
      id: approval.id,
      approverId: approval.approverId,
      approverName: approval.approver ? approval.approver.name : null,
      level: approval.level,
      status: approval.status,
      comments: approval.comments,
      actedAt: approval.actedAt,
      createdAt: approval.createdAt
    };
  }

  static toCommentDto(comment) {
    if (!comment) return null;
    return {
      id: comment.id,
      authorId: comment.authorId,
      authorName: comment.author ? comment.author.name : null,
      comment: comment.comment,
      isPrivate: comment.isPrivate,
      createdAt: comment.createdAt
    };
  }

  static toHistoryDto(historyItem) {
    if (!historyItem) return null;
    return {
      id: historyItem.id,
      actorId: historyItem.actorId,
      actorName: historyItem.actor ? historyItem.actor.name : null,
      action: historyItem.action,
      fromStatus: historyItem.fromStatus,
      toStatus: historyItem.toStatus,
      notes: historyItem.notes,
      createdAt: historyItem.createdAt
    };
  }

  static toAuditDto(auditItem) {
    if (!auditItem) return null;
    return {
      id: auditItem.id,
      actorId: auditItem.actorId,
      actorName: auditItem.actor ? auditItem.actor.name : null,
      fieldName: auditItem.fieldName,
      oldValue: auditItem.oldValue,
      newValue: auditItem.newValue,
      reason: auditItem.reason,
      createdAt: auditItem.createdAt
    };
  }
}
