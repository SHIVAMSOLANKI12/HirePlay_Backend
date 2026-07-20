import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { 
  findHighestRoundNumber, 
  createInterview 
} from "../repositories/interview.repository.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";

/**
 * Orchestrates scheduling a new interview round linked to a parent interview.
 */
export const scheduleRoundWorkflow = async (user, parentInterviewId, data) => {
  // 1. Validate Target Parent Interview
  const parentInterview = await verifyInterviewAccess(user, parentInterviewId);

  // 1.a Validate Parent exists and is a root interview
  if (parentInterview.parentInterviewId !== null) {
    throw new AppError("Cannot attach a round to another child round. Must attach to a root interview.", 400);
  }

  // 3. Status check: Ensure the interview process isn't closed
  if (parentInterview.status === "COMPLETED" || parentInterview.status === "CANCELLED") {
    throw new AppError(`Cannot add new rounds to a ${parentInterview.status} interview process`, 400);
  }

  return await prisma.$transaction(async (tx) => {
    // 4. Validate round number and sequence
    const highestRound = await findHighestRoundNumber(parentInterview.id, tx);
    
    if (data.roundNumber <= highestRound) {
      throw new AppError(`Round number must be greater than the current highest round (${highestRound})`, 400);
    }
    
    if (data.roundNumber !== highestRound + 1) {
      throw new AppError(`Cannot skip round order. Expected round ${highestRound + 1}`, 400);
    }

    // 5. Create the Interview Round
    const round = await createInterview({
      applicationId: parentInterview.applicationId,
      companyId: parentInterview.companyId,
      candidateId: parentInterview.candidateId,
      jobId: parentInterview.jobId,
      scheduledById: user.id,
      parentInterviewId: parentInterview.id,
      roundNumber: data.roundNumber,
      roundName: data.roundName,
      sequence: data.roundNumber, // Keep sequence in sync with roundNumber for simplicity
      title: data.title,
      description: data.description,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
      timezone: data.timezone,
      meetingLink: data.meetingLink,
      location: data.location,
      notes: data.notes,
    }, tx);

    // 6. Log Domain Events for the timeline and dashboard
    await logApplicationActivity({
      applicationId: parentInterview.applicationId,
      performedBy: user.id,
      action: "INTERVIEW_SCHEDULED",
      metadata: { 
        interviewId: round.id, 
        parentInterviewId: parentInterview.id,
        roundNumber: round.roundNumber, 
        title: round.title, 
        type: round.type, 
        scheduledAt: round.scheduledAt 
      },
    }, tx);

    eventEngine.emit(ACTIVITY_EVENTS.INTERVIEW_SCHEDULED, {
      userId: parentInterview.candidateId,
      companyId: parentInterview.companyId,
      entityId: round.id,
      performedByRole: user.role,
      newValue: { title: `Interview Round ${round.roundNumber} Scheduled`, description: `Round ${round.roundNumber} (${round.title}) has been scheduled.` },
      metadata: { applicationId: parentInterview.applicationId, jobId: parentInterview.jobId, roundNumber: round.roundNumber }
    });

    // Fetch the newly created round with minimal relations for response
    return await tx.interview.findUnique({
      where: { id: round.id },
      include: {
        scheduledBy: true,
      },
    });
  });
};
