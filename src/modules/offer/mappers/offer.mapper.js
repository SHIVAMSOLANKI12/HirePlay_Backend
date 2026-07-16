export const toOfferDTO = (offer) => {
  if (!offer) return null;

  return {
    id: offer.id,
    applicationId: offer.applicationId,
    status: offer.status,
    jobTitle: offer.jobTitle,
    department: offer.department,
    employmentType: offer.employmentType,
    salary: offer.salary,
    currency: offer.currency,
    joiningDate: offer.joiningDate,
    location: offer.location,
    reportingManager: offer.reportingManager,
    notes: offer.notes,
    validUntil: offer.validUntil,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    candidate: offer.candidate ? {
      id: offer.candidate.id,
      name: offer.candidate.name,
      email: offer.candidate.email,
    } : undefined,
    job: offer.job ? {
      id: offer.job.id,
      title: offer.job.title,
      department: offer.job.department,
    } : undefined,
    interviewDecision: offer.interviewDecision || undefined // Will be populated in workflow
  };
};

export const toOfferListDTO = (offers) => {
  if (!Array.isArray(offers)) return [];
  return offers.map(offer => toOfferDTO(offer));
};

export const toWorkflowDTO = (workflow) => {
  if (!workflow) return null;
  return {
    offerId: workflow.id,
    currentStatus: workflow.status,
    createdAt: workflow.createdAt,
    approvedAt: workflow.approvedAt || null,
    sentAt: workflow.sentAt || null,
    approvedBy: workflow.approvedBy ? {
      id: workflow.approvedBy.id,
      name: workflow.approvedBy.name,
      email: workflow.approvedBy.email,
    } : null,
    sentBy: workflow.sentBy ? {
      id: workflow.sentBy.id,
      name: workflow.sentBy.name,
      email: workflow.sentBy.email,
    } : null,
  };
};

export const toOfferStatusDTO = (offer) => {
  if (!offer) return null;
  return {
    id: offer.id,
    status: offer.status,
    updatedAt: offer.updatedAt || new Date()
  };
};

export const toCandidateOfferDTO = (offer) => {
  if (!offer) return null;
  return {
    id: offer.id,
    company: offer.company ? {
      id: offer.company.id,
      name: offer.company.name,
      logo: offer.company.logo
    } : null,
    job: offer.job ? {
      id: offer.job.id,
      title: offer.job.title,
      department: offer.job.department
    } : null,
    status: offer.status,
    employmentType: offer.employmentType,
    salary: offer.salary,
    currency: offer.currency,
    joiningDate: offer.joiningDate,
    location: offer.location,
    reportingManager: offer.reportingManager,
    notes: offer.notes,
    validUntil: offer.validUntil,
    acceptedAt: offer.acceptedAt || null,
    rejectedAt: offer.rejectedAt || null,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt
  };
};

export const toCandidateOfferListDTO = (offers) => {
  if (!Array.isArray(offers)) return [];
  return offers.map(offer => toCandidateOfferDTO(offer));
};

export const toOfferExpiryStatusDTO = (offer, isExpired, eligible) => {
  if (!offer) return null;
  return {
    id: offer.id,
    status: offer.status,
    validUntil: offer.validUntil,
    isExpired,
    eligibleForCandidateResponse: eligible
  };
};

export const toTimelineDTO = (event) => {
  if (!event) return null;
  return {
    id: event.id,
    type: event.type,
    title: event.title,
    description: event.description,
    performedBy: event.performedBy ? {
      id: event.performedBy.id,
      name: event.performedBy.name,
      email: event.performedBy.email
    } : null,
    performedByRole: event.performedByRole,
    createdAt: event.createdAt
  };
};

export const toTimelineListDTO = (events) => {
  if (!Array.isArray(events)) return [];
  return events.map(event => toTimelineDTO(event));
};

export const toAuditLogDTO = (log) => {
  if (!log) return null;
  return {
    id: log.id,
    action: log.action,
    field: log.field,
    oldValue: log.oldValue,
    newValue: log.newValue,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    performedBy: log.performedBy ? {
      id: log.performedBy.id,
      name: log.performedBy.name,
      email: log.performedBy.email
    } : null,
    performedByRole: log.performedByRole,
    createdAt: log.createdAt
  };
};

export const toAuditLogListDTO = (logs) => {
  if (!Array.isArray(logs)) return [];
  return logs.map(log => toAuditLogDTO(log));
};
