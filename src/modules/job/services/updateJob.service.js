import AppError from "../../../utils/AppError.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
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

  let eventName = ACTIVITY_EVENTS.JOB_UPDATED;
  if (dataToUpdate.status === "CLOSED" && existingJob.status !== "CLOSED") {
    eventName = ACTIVITY_EVENTS.JOB_CLOSED;
  } else if (dataToUpdate.status === "PUBLISHED" && existingJob.status !== "PUBLISHED") {
    eventName = ACTIVITY_EVENTS.JOB_PUBLISHED;
  }

  eventEngine.emit(eventName, {
    userId: user.id,
    companyId: existingJob.companyId,
    entityId: updatedJob.id,
    performedByRole: user.role,
    oldValue: { status: existingJob.status },
    newValue: { status: updatedJob.status, updatedFields: Object.keys(dataToUpdate) }
  });

  return JobDTO.toResponse(updatedJob);
};
