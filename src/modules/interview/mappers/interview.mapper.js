/**
 * Formats Interview object for API responses.
 * Hides raw Prisma metadata and flattens relations cleanly.
 */
export const toInterviewDTO = (interview) => {
  if (!interview) return null;

  return {
    id: interview.id,
    title: interview.title,
    description: interview.description,
    type: interview.type,
    status: interview.status,
    scheduledAt: interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    timezone: interview.timezone,
    meetingLink: interview.meetingLink,
    location: interview.location,
    notes: interview.notes,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
    
    application: interview.application ? {
      id: interview.application.id,
      status: interview.application.status,
    } : undefined,

    candidate: interview.candidate ? {
      id: interview.candidate.id,
      name: interview.candidate.name,
      email: interview.candidate.email,
    } : undefined,

    job: interview.job ? {
      id: interview.job.id,
      title: interview.job.title,
    } : undefined,

    company: interview.company ? {
      id: interview.company.id,
      name: interview.company.name,
    } : undefined,

    scheduledBy: interview.scheduledBy ? {
      id: interview.scheduledBy.id,
      name: interview.scheduledBy.name,
    } : undefined,

    // Multi-round specific fields
    roundNumber: interview.roundNumber,
    roundName: interview.roundName,
    parentInterviewId: interview.parentInterviewId,
    sequence: interview.sequence,
    isFinalRound: interview.isFinalRound,
    completedAt: interview.completedAt,
  };
};

/**
 * Formats an entire interview process including all its rounds.
 */
export const toInterviewProcessDTO = (process) => {
  if (!process) return null;

  const baseDTO = toInterviewDTO(process);
  
  return {
    ...baseDTO,
    rounds: process.childRounds ? process.childRounds.map(toInterviewDTO) : [],
  };
};
