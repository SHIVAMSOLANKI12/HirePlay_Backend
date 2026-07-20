import AppError from "../../../utils/AppError.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import { softDeleteJob } from "../repositories/job.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";

export const softDeleteJobService = async (user, jobId) => {
  const existingJob = await verifyRecruiterJobAccess(user, jobId);

  await softDeleteJob(jobId);

  eventEngine.emit(ACTIVITY_EVENTS.JOB_DELETED, {
    userId: user.id,
    companyId: existingJob.companyId,
    entityId: jobId,
    performedByRole: user.role,
    metadata: { jobTitle: existingJob.title }
  });

  return true;
};
