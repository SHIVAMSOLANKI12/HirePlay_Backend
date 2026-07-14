import AppError from "../../../utils/AppError.js";
import { findApplicationById } from "../repositories/application.repository.js";
import { findActivities } from "../../activity/repositories/activity.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { toTimelineList } from "../../shared/mappers/activity.mapper.js";

export const getApplicationTimelineService = async (user, applicationId) => {
  // 1. Fetch Application
  const application = await findApplicationById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Recruiter Access
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Fetch all activities for the application
  // We don't paginate the timeline to give a complete sequential view.
  const { items: activities } = await findActivities({
    where: { applicationId, deletedAt: null },
    orderBy: { createdAt: "asc" }, // Oldest to newest
  });

  // 4. Map to DTO
  return toTimelineList(activities);
};
