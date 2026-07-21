import { generatePuzzlesForAttempt, getCandidatePuzzles } from "../services/puzzle.service.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import prisma from "../../../config/prisma.js";

export const generatePuzzleWorkflow = async (assessmentId, candidateId, user) => {
  // 0. Ensure Assessment Exists
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId }
  });
  if (!assessment) {
    const AppError = (await import("../../../utils/AppError.js")).default;
    throw new AppError("Assessment not found", 404);
  }

  // 1. Ensure Attempt Exists (Auto-create if not)
  let attempt = await prisma.assessmentAttempt.findFirst({
    where: { assessmentId, candidateId }
  });

  if (!attempt) {
    attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        candidateId,
        status: "NOT_STARTED"
      }
    });
    
    // Log Attempt Creation / Assignment
    await logActivity({
      companyId: user.companyId,
      userId: user.id,
      entityType: ACTIVITY_ENTITIES.ASSESSMENT,
      entityId: assessmentId,
      action: ACTIVITY_ACTIONS.ASSIGN,
      metadata: { candidateId, attemptId: attempt.id },
      performedByRole: user.role
    });
  }

  // 2. Generate Puzzles
  const puzzles = await generatePuzzlesForAttempt(assessmentId, candidateId, attempt.id);

  // 3. Log Generation
  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: assessmentId,
    action: ACTIVITY_ACTIONS.GENERATE,
    metadata: { candidateId, generatedGamesCount: puzzles.length },
    performedByRole: user.role
  });

  return puzzles;
};

export const getCandidatePuzzlesWorkflow = async (assessmentId, user) => {
  // 1. A candidate can only fetch their own puzzles
  const candidateId = user.id;

  // 2. Fetch Puzzles
  const puzzles = await getCandidatePuzzles(assessmentId, candidateId);

  return puzzles;
};
