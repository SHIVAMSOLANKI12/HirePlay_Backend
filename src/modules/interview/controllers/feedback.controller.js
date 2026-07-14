import { successResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/AppError.js";
import { createFeedbackWorkflow } from "../workflows/createFeedback.workflow.js";
import { updateFeedbackWorkflow } from "../workflows/updateFeedback.workflow.js";
import { getInterviewFeedbacksWorkflow } from "../workflows/getInterviewFeedbacks.workflow.js";
import { createFeedbackSchema, updateFeedbackSchema } from "../validations/feedback.validation.js";
import { toFeedbackDTO } from "../mappers/feedback.mapper.js";

/**
 * Creates feedback for an interview round.
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Validate Input
    const validationResult = createFeedbackSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const rawFeedback = await createFeedbackWorkflow(req.user, interviewId, validationResult.data);

    // 3. Map Response
    const formattedFeedback = toFeedbackDTO(rawFeedback);

    // 4. Send Response
    return successResponse(res, formattedFeedback, "Interview feedback submitted successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates existing feedback for an interview round.
 */
export const updateFeedback = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Validate Input
    const validationResult = updateFeedbackSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const rawFeedback = await updateFeedbackWorkflow(req.user, interviewId, validationResult.data);

    // 3. Map Response
    const formattedFeedback = toFeedbackDTO(rawFeedback);

    // 4. Send Response
    return successResponse(res, formattedFeedback, "Interview feedback updated successfully", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all feedbacks for a specific interview round.
 */
export const getInterviewFeedbacks = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Execute Workflow
    const rawFeedbacks = await getInterviewFeedbacksWorkflow(req.user, interviewId);

    // 2. Map Response
    const formattedFeedbacks = rawFeedbacks.map(toFeedbackDTO);

    // 3. Send Response
    return successResponse(res, formattedFeedbacks, "Interview feedbacks retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};
