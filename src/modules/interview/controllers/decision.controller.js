import { successResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/AppError.js";
import { getTimelineWorkflow } from "../workflows/getTimeline.workflow.js";
import { getDecisionWorkflow } from "../workflows/getDecision.workflow.js";
import { updateDecisionWorkflow } from "../workflows/updateDecision.workflow.js";
import { updateDecisionSchema } from "../validations/decision.validation.js";
import { toTimelineDTO, toDecisionDTO } from "../mappers/decision.mapper.js";

/**
 * Gets the chronological timeline of an interview process.
 */
export const getInterviewTimeline = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Execute Workflow
    const rawTimeline = await getTimelineWorkflow(req.user, interviewId);

    // 2. Map Response
    const formattedTimeline = toTimelineDTO(rawTimeline);

    // 3. Send Response
    return successResponse(res, formattedTimeline, "Interview timeline retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets the current decision state and feedback summary.
 */
export const getInterviewDecision = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Execute Workflow
    const rawDecision = await getDecisionWorkflow(req.user, interviewId);

    // 2. Map Response
    const formattedDecision = toDecisionDTO(rawDecision);

    // 3. Send Response
    return successResponse(res, formattedDecision, "Interview decision retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the final hiring decision of an interview process.
 */
export const updateInterviewDecision = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) throw new AppError("Interview ID is required", 400);

    // 1. Validate Input
    const validationResult = updateDecisionSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const rawDecision = await updateDecisionWorkflow(req.user, interviewId, validationResult.data);

    // 3. Map Response
    const formattedDecision = toDecisionDTO(rawDecision);

    // 4. Send Response
    return successResponse(res, formattedDecision, "Interview decision updated successfully", 200);
  } catch (error) {
    next(error);
  }
};
