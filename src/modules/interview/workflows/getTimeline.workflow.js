import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyInterviewAccess } from "../services/interview.validation.service.js";
import { buildInterviewTimeline } from "../services/timeline.service.js";

/**
 * Orchestrates fetching the chronological timeline of an interview.
 */
export const getTimelineWorkflow = async (user, interviewId) => {
  // 1. Fetch & Verify Interview
  const interview = await verifyInterviewAccess(user, interviewId);

  // 3. Build Timeline
  const timeline = await buildInterviewTimeline(interviewId);

  return timeline;
};
