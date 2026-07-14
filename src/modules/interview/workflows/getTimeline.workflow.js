import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { buildInterviewTimeline } from "../services/timeline.service.js";

/**
 * Orchestrates fetching the chronological timeline of an interview.
 */
export const getTimelineWorkflow = async (user, interviewId) => {
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

  // 3. Build Timeline
  const timeline = await buildInterviewTimeline(interviewId);

  return timeline;
};
