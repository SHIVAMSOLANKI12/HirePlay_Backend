import AppError from "../../../utils/AppError.js";
import { softDeleteJob } from "../repositories/job.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const softDeleteJobService = async (user, jobId) => {
  const existingJob = await verifyRecruiterJobAccess(user, jobId);

  await softDeleteJob(jobId);

  return true;
};
