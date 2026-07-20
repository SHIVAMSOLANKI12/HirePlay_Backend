import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findApplicationById } from "../../application/repositories/application.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { createInterview, findConflictingInterview } from "../repositories/interview.repository.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { APPLICATION_STATUS } from "../../shared/constants/applicationStatus.constants.js";
import { createActivityLog } from "../../activity/services/activityLog.service.js";

/**
 * Orchestrates the creation of a new Interview.
 */
export const scheduleInterviewWorkflow = async (user, data) => {
  // 1. Fetch Application first to get jobId
  const application = await prisma.application.findUnique({
    where: { id: data.applicationId },
    select: {
      id: true,
      jobId: true,
      status: true,
      job: { select: { companyId: true, id: true } },
      candidateId: true
    }
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Job and Ownership using application.jobId
  const job = await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Application status check (Optional based on business rules, but usually should be SHORTLISTED or INTERVIEW)
  const allowedStatuses = [APPLICATION_STATUS.SCREENING, APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.INTERVIEW, APPLICATION_STATUS.APPLIED];
  if (!allowedStatuses.includes(application.status)) {
    throw new AppError(`Cannot schedule interview for application in ${application.status} status`, 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    // 4. Check for duplicate schedules for the exact time
    const conflict = await findConflictingInterview(application.id, new Date(data.scheduledAt), tx);
    if (conflict) {
      throw new AppError("An interview is already scheduled for this application at the requested time", 409);
    }

    // 5. Create the Interview
    const interview = await createInterview({
      applicationId: application.id,
      companyId: application.job.companyId,
      candidateId: application.candidateId,
      jobId: application.jobId,
      scheduledById: user.id, // Using global auth tracking ID
      title: data.title,
      description: data.description,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
      timezone: data.timezone,
      meetingLink: data.meetingLink,
      location: data.location,
      notes: data.notes,
    }, tx);

    // 6. Log Domain Events for the timeline and dashboard
    await logApplicationActivity({
      applicationId: application.id,
      performedBy: user.id, // Using global auth tracking ID
      action: "INTERVIEW_SCHEDULED",
      metadata: { interviewId: interview.id, title: interview.title, type: interview.type, scheduledAt: interview.scheduledAt },
    }, tx);

    await createActivityLog({
      userId: application.candidateId,
      companyId: application.job.companyId,
      applicationId: application.id,
      jobId: application.jobId,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview Scheduled",
      description: `An interview "${interview.title}" has been scheduled.`,
      metadata: { interviewId: interview.id },
    }, tx);

    // We fetch the newly created interview with all relationships for the mapper
    const populatedInterview = await tx.interview.findUnique({
      where: { id: interview.id },
      include: {
        application: true,
        company: true,
        candidate: true,
        job: true,
        scheduledBy: true,
      },
    });

    return populatedInterview;
  });

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.INTERVIEW_SCHEDULED, {
    companyId: result.companyId,
    userId: result.candidateId, // Candidate is the recipient
    type: "INTERVIEW",
    channel: "EMAIL",
    title: "Interview Scheduled",
    message: `Your interview for ${result.job.title} has been scheduled.`,
    metadata: { interviewId: result.id },
    eventName: NOTIFICATION_EVENTS.INTERVIEW_SCHEDULED,
    CandidateName: result.candidate?.firstName || "Candidate",
    JobTitle: result.job?.title,
    CompanyName: result.company?.name,
    InterviewDate: new Date(result.scheduledAt).toLocaleDateString(),
    InterviewTime: new Date(result.scheduledAt).toLocaleTimeString(),
    RecruiterName: result.scheduledBy?.firstName || "Recruiter",
    recipientEmail: result.candidate?.email
  });

  return result;
};
