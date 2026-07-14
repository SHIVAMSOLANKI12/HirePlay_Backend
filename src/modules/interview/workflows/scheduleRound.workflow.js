import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { 
  findRootInterviewById, 
  findHighestRoundNumber, 
  createInterview 
} from "../repositories/interview.repository.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { createActivityLog } from "../../activity/services/activityLog.service.js";

/**
 * Orchestrates the creation of a new Interview Round.
 */
export const scheduleRoundWorkflow = async (user, parentInterviewId, data) => {
  // 1. Fetch Root Interview Process
  const parentInterview = await findRootInterviewById(parentInterviewId);
  if (!parentInterview) {
    throw new AppError("Interview process not found or is not a root interview", 404);
  }

  // 2. Verify Ownership and Role (Recruiter/Company Admin must own the Job)
  await verifyRecruiterJobAccess(user, parentInterview.jobId);

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

    await createActivityLog({
      userId: parentInterview.candidateId,
      companyId: parentInterview.companyId,
      applicationId: parentInterview.applicationId,
      jobId: parentInterview.jobId,
      type: "INTERVIEW_SCHEDULED",
      title: `Interview Round ${round.roundNumber} Scheduled`,
      description: `Round ${round.roundNumber} (${round.title}) has been scheduled.`,
      metadata: { interviewId: round.id, roundNumber: round.roundNumber },
    }, tx);

    // Fetch the newly created round with minimal relations for response
    return await tx.interview.findUnique({
      where: { id: round.id },
      include: {
        scheduledBy: true,
      },
    });
  });
};
