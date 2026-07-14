import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/AppError.js";
import { getApplicantsParamsSchema, getApplicantsQuerySchema } from "../validations/getApplicants.validation.js";
import { getApplicantsService } from "../services/getApplicants.service.js";
import { getApplicantsCSVStream } from "../services/exportApplicants.service.js";

export const getApplicantsController = asyncHandler(async (req, res) => {
  const paramResult = getApplicantsParamsSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new AppError("Invalid Job ID", 400);
  }

  const queryResult = getApplicantsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    throw new AppError("Invalid query parameters", 400);
  }

  const { jobId } = paramResult.data;

  const responseData = await getApplicantsService(req.user, jobId, queryResult.data);

  return successResponse(
    res,
    responseData,
    "Applicants fetched successfully.",
    200
  );
});

export const exportApplicantsController = asyncHandler(async (req, res) => {
  const paramResult = getApplicantsParamsSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new AppError("Invalid Job ID", 400);
  }

  const queryResult = getApplicantsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    throw new AppError("Invalid query parameters", 400);
  }

  const { jobId } = paramResult.data;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="applicants_export_${jobId}.csv"`);

  try {
    const csvStream = getApplicantsCSVStream(req.user, jobId, queryResult.data);
    for await (const chunk of csvStream) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    // If headers are not sent, we can still pass the error to the global handler
    if (!res.headersSent) {
      throw error;
    }
    console.error("Stream failed during CSV generation:", error);
    res.end();
  }
});
