import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";
import { updateInterviewState, createInterviewHistory } from "../repositories/lifecycle.repository.js";
import { onInterviewCancelled } from "../services/interviewHooks.service.js";

/**
 * Orchestrates the cancellation of an interview.
 */
export const cancelInterviewWorkflow = async (user, interviewId, data) => {
  // 1. Fetch & Verify Interview
  const interview = await verifyInterviewAccess(user, interviewId);

  // 3. Status Transition Rules
  if (interview.status === "COMPLETED" || interview.status === "CANCELLED") {
    throw new AppError(`Cannot cancel a ${interview.status} interview`, 400);
  }

  // 4. Transaction
  return await prisma.$transaction(async (tx) => {
    const oldStatus = interview.status;
    const newStatus = "CANCELLED";

    // 4.a Update Interview
    const updatedInterview = await updateInterviewState(
      interview.id,
      {
        status: newStatus,
      },
      tx
    );

    // 4.b Create History
    const history = await createInterviewHistory(
      {
        interviewId: interview.id,
        action: "CANCELLED",
        oldScheduledAt: interview.scheduledAt,
        newScheduledAt: interview.scheduledAt, // Remained the same
        oldStatus,
        newStatus,
        reason: data.reason,
        performedById: user.id,
      },
      tx
    );

    // 4.c Trigger Hooks
    await onInterviewCancelled(updatedInterview, history, user, tx);

    return { interview: updatedInterview, history };
  });
};
