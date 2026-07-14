import { successResponse } from "../../../utils/apiResponse.js";
import { scheduleRoundWorkflow } from "../workflows/scheduleRound.workflow.js";
import { scheduleRoundSchema } from "../validations/scheduleRound.validation.js";
import { toInterviewDTO, toInterviewProcessDTO } from "../mappers/interview.mapper.js";
import AppError from "../../../utils/AppError.js";
import { getInterviewRoundsWorkflow } from "../workflows/getInterviewRounds.workflow.js";
import { getApplicationInterviewsWorkflow } from "../workflows/getApplicationInterviews.workflow.js";

/**
 * Creates a new interview round for an existing interview process.
 */
export const scheduleRound = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Validate Input
    const validationResult = scheduleRoundSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const rawRound = await scheduleRoundWorkflow(req.user, interviewId, validationResult.data);

    // 3. Map Response
    const formattedRound = toInterviewDTO(rawRound);

    // 4. Send Response
    return successResponse(res, formattedRound, "Interview round scheduled successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets the entire interview process and all its rounds.
 */
export const getInterviewRounds = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    const rawProcess = await getInterviewRoundsWorkflow(req.user, interviewId);
    
    const formattedProcess = toInterviewProcessDTO(rawProcess);

    return successResponse(res, formattedProcess, "Interview rounds retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all interview processes for a specific application.
 */
export const getApplicationInterviews = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    if (!applicationId) throw new AppError("Application ID is required", 400);

    const rawProcesses = await getApplicationInterviewsWorkflow(req.user, applicationId);
    
    const formattedProcesses = rawProcesses.map(toInterviewProcessDTO);

    return successResponse(res, formattedProcesses, "Application interviews retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};
