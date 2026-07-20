import AppError from "../../../utils/AppError.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { createJob } from "../repositories/job.repository.js";
import JobMapper from "../mappers/job.mapper.js";
import JobDTO from "../dto/job.dto.js";

export const createJobService = async (user, payload) => {
  let companyId = user.companyId;

  // If companyId is not in JWT (e.g., Company Admin / Owner), fetch it
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to create a job.", 404);
  }

  const jobData = JobMapper.toCreateData(payload, companyId, user.id);

  const newJob = await createJob(jobData);

  eventEngine.emit(ACTIVITY_EVENTS.JOB_CREATED, {
    userId: user.id,
    companyId: companyId,
    entityId: newJob.id,
    performedByRole: user.role,
    newValue: { title: newJob.title, description: `Created new job: ${newJob.title}.` },
    metadata: { createdByHR: user.role === "HR", hrEmail: user.email }
  });

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.JOB_PUBLISHED, {
    companyId: companyId,
    userId: user.id, // Using global auth tracking ID
    type: "SYSTEM",
    channel: "EMAIL",
    title: "Job Published",
    message: `Job ${newJob.title} has been successfully published.`,
    metadata: { jobId: newJob.id },
    eventName: NOTIFICATION_EVENTS.JOB_PUBLISHED,
    JobTitle: newJob.title,
    recipientEmail: user.email // Ensure the email goes to the HR who created the job
  });

  return JobDTO.toResponse(newJob);
};
