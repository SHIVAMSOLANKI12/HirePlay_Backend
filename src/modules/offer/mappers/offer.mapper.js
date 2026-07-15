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
