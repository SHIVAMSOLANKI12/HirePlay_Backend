import AppError from "../../../utils/AppError.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import JobDTO from "../dto/job.dto.js";

export const getJobByIdService = async (user, jobId) => {
  const job = await verifyRecruiterJobAccess(user, jobId);

  return JobDTO.toResponse(job);
};
