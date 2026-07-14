import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { updateInterviewState, createInterviewHistory } from "../repositories/lifecycle.repository.js";
import { onInterviewRescheduled } from "../services/interviewHooks.service.js";

/**
 * Orchestrates the rescheduling of an interview.
 */
export const rescheduleInterviewWorkflow = async (user, interviewId, data) => {
  // 1. Fetch Interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { job: true },
  });

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  // 2. Verify Ownership
  await verifyRecruiterJobAccess(user, interview.jobId);

  // 3. Status Transition Rules
  if (interview.status === "COMPLETED" || interview.status === "CANCELLED") {
    throw new AppError(`Cannot reschedule a ${interview.status} interview`, 400);
  }

  // 4. Validate future date
  const newScheduledAt = new Date(data.scheduledAt);
  if (newScheduledAt <= new Date()) {
    throw new AppError("New interview date must be in the future", 400);
  }

  // 5. Transaction
  return await prisma.$transaction(async (tx) => {
    const oldStatus = interview.status;
    const oldScheduledAt = interview.scheduledAt;
    const newStatus = "RESCHEDULED";

    // 5.a Update Interview
    const updatedInterview = await updateInterviewState(
      interview.id,
      {
        scheduledAt: newScheduledAt,
        durationMinutes: data.durationMinutes,
        timezone: data.timezone,
        meetingLink: data.meetingLink !== undefined ? data.meetingLink : interview.meetingLink,
        location: data.location !== undefined ? data.location : interview.location,
        status: newStatus,
      },
      tx
    );

    // 5.b Create History
    const history = await createInterviewHistory(
      {
        interviewId: interview.id,
        action: "RESCHEDULED",
        oldScheduledAt,
        newScheduledAt,
        oldStatus,
        newStatus,
        reason: data.reason,
        performedById: user.id,
      },
      tx
    );

    // 5.c Trigger Hooks
    await onInterviewRescheduled(updatedInterview, history, user, tx);

    return { interview: updatedInterview, history };
  });
};
