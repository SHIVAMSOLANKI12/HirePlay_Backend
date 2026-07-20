import AppError from "../../../utils/AppError.js";
import { updateJob } from "../repositories/job.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import JobDTO from "../dto/job.dto.js";

import { VALID_JOB_TRANSITIONS } from "../../shared/constants/job.constants.js";

export const changeJobStatusService = async (user, jobId, newStatus) => {
  const existingJob = await verifyRecruiterJobAccess(user, jobId);

  const currentStatus = existingJob.status;

  // Validate state transition
  const allowedPreviousStates = VALID_JOB_TRANSITIONS[newStatus];
  if (!allowedPreviousStates || !allowedPreviousStates.includes(currentStatus)) {
    throw new AppError(
      `Invalid state transition from ${currentStatus} to ${newStatus}.`,
      409
    );
  }

  const dataToUpdate = { status: newStatus };

  // Specific rule for publishing
  if (newStatus === "PUBLISHED" && currentStatus === "DRAFT") {
    dataToUpdate.publishedAt = new Date();
  }

  const updatedJob = await updateJob(jobId, dataToUpdate);

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  if (newStatus === "PUBLISHED") {
    publishNotificationEvent(NOTIFICATION_EVENTS.JOB_PUBLISHED, {
      companyId: existingJob.companyId,
      userId: user.id,
      type: "SYSTEM",
      channel: "EMAIL",
      title: "Job Published",
      message: `Job ${updatedJob.title} has been successfully published.`,
      metadata: { jobId: updatedJob.id },
      eventName: NOTIFICATION_EVENTS.JOB_PUBLISHED,
      JobTitle: updatedJob.title
    });
  } else if (newStatus === "CLOSED") {
    publishNotificationEvent(NOTIFICATION_EVENTS.JOB_CLOSED, {
      companyId: existingJob.companyId,
      userId: user.id,
      type: "SYSTEM",
      channel: "EMAIL",
      title: "Job Closed",
      message: `Job ${updatedJob.title} has been closed.`,
      metadata: { jobId: updatedJob.id },
      eventName: NOTIFICATION_EVENTS.JOB_CLOSED,
      JobTitle: updatedJob.title
    });
  }

  return JobDTO.toResponse(updatedJob);
};
