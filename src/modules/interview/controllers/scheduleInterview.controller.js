import { successResponse } from "../../../utils/apiResponse.js";
import { scheduleInterviewWorkflow } from "../workflows/scheduleInterview.workflow.js";
import { scheduleInterviewSchema } from "../validations/scheduleInterview.validation.js";
import { toInterviewDTO } from "../mappers/interview.mapper.js";
import AppError from "../../../utils/AppError.js";

export const scheduleInterview = async (req, res, next) => {
  try {
    // 1. Validate Input
    const validationResult = scheduleInterviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Validation Failed", 400, validationResult.errors);
    }

    // 2. Execute Workflow
    const rawInterview = await scheduleInterviewWorkflow(req.user, validationResult.data);

    // 3. Map Response
    const formattedInterview = toInterviewDTO(rawInterview);

    // 4. Send Response
    return successResponse(res, formattedInterview, "Interview scheduled successfully", 201);
  } catch (error) {
    next(error);
  }
};
