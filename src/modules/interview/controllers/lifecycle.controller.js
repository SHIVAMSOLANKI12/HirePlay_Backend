import { successResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/AppError.js";
import { rescheduleInterviewWorkflow } from "../workflows/rescheduleInterview.workflow.js";
import { cancelInterviewWorkflow } from "../workflows/cancelInterview.workflow.js";
import { getInterviewHistoryWorkflow } from "../workflows/getInterviewHistory.workflow.js";
import { rescheduleInterviewSchema, cancelInterviewSchema } from "../validations/lifecycle.validation.js";
import { toHistoryDTO } from "../mappers/lifecycle.mapper.js";
import { toInterviewDTO } from "../mappers/interview.mapper.js";

/**
 * Reschedules an interview.
 */
export const rescheduleInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Validate Input
    const validationResult = rescheduleInterviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const { interview, history } = await rescheduleInterviewWorkflow(req.user, interviewId, validationResult.data);

    // 3. Map Response
    const responsePayload = {
      interview: toInterviewDTO(interview),
      history: toHistoryDTO(history),
    };

    // 4. Send Response
    return successResponse(res, responsePayload, "Interview rescheduled successfully", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancels an interview.
 */
export const cancelInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Validate Input
    const validationResult = cancelInterviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const { interview, history } = await cancelInterviewWorkflow(req.user, interviewId, validationResult.data);

    // 3. Map Response
    const responsePayload = {
      interview: toInterviewDTO(interview),
      history: toHistoryDTO(history),
    };

    // 4. Send Response
    return successResponse(res, responsePayload, "Interview cancelled successfully", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets the lifecycle history of an interview.
 */
export const getInterviewHistory = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Execute Workflow
    const rawHistory = await getInterviewHistoryWorkflow(req.user, interviewId);

    // 2. Map Response
    const formattedHistory = rawHistory.map(toHistoryDTO);

    // 3. Send Response
    return successResponse(res, formattedHistory, "Interview history retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};
