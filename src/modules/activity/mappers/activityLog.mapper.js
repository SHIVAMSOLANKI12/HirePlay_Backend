export const toActivityLogDTO = (log) => {
  if (!log) return null;
  return {
    id: log.id,
    companyId: log.companyId,
    userId: log.userId,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    oldValue: log.oldValue,
    newValue: log.newValue,
    metadata: log.metadata,
    // Sensitive fields like ipAddress and userAgent are excluded intentionally
    performedByRole: log.performedByRole,
    createdAt: log.createdAt
  };
};

export const toActivityLogsDTO = (logs) => {
  return logs.map(toActivityLogDTO);
};
