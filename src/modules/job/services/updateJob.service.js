import AppError from "../../../utils/AppError.js";
import { updateJob } from "../repositories/job.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import JobDTO from "../dto/job.dto.js";

export const updateJobService = async (user, jobId, payload) => {
  const existingJob = await verifyRecruiterJobAccess(user, jobId);

  const dataToUpdate = { ...payload };

  // If status is being updated to PUBLISHED and it wasn't PUBLISHED before, set publishedAt
  if (dataToUpdate.status === "PUBLISHED" && existingJob.status !== "PUBLISHED") {
    dataToUpdate.publishedAt = new Date();
  }

  // Ensure salaryMax is valid with existing salaryMin if only one is updated
  const newSalaryMin = dataToUpdate.salaryMin !== undefined ? dataToUpdate.salaryMin : existingJob.salaryMin;
  const newSalaryMax = dataToUpdate.salaryMax !== undefined ? dataToUpdate.salaryMax : existingJob.salaryMax;

  if (newSalaryMin !== null && newSalaryMax !== null && newSalaryMax < newSalaryMin) {
    throw new AppError("Maximum salary must be greater than or equal to minimum salary.", 400);
  }

  const updatedJob = await updateJob(jobId, dataToUpdate);

  // Track reusable ActivityLog for dashboards
  const { createActivityLog } = await import("../../activity/services/activityLog.service.js");
  
  // Distinguish between closing a job and general updates
  let activityType = "JOB_UPDATED";
  let title = "Job Updated";
  if (dataToUpdate.status === "CLOSED" && existingJob.status !== "CLOSED") {
    activityType = "JOB_CLOSED";
    title = "Job Closed";
  }

  await createActivityLog({
    userId: user.id,
    companyId: existingJob.companyId,
    applicationId: null,
    jobId: updatedJob.id,
    type: activityType,
    title,
    description: `Job "${updatedJob.title}" was ${activityType === "JOB_CLOSED" ? "closed" : "updated"}.`,
    metadata: null,
  });

  return JobDTO.toResponse(updatedJob);
};
