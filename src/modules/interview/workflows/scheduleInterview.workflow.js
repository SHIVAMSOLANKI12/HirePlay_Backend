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
  // 1. Fetch Application
  const application = await findApplicationById(data.applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Ownership and Role (Recruiter/Company Admin must own the Job)
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Application status check (Optional based on business rules, but usually should be SHORTLISTED or INTERVIEW)
  const allowedStatuses = [APPLICATION_STATUS.SCREENING, APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.INTERVIEW, APPLICATION_STATUS.APPLIED];
  if (!allowedStatuses.includes(application.status)) {
    throw new AppError(`Cannot schedule interview for application in ${application.status} status`, 400);
  }

  return await prisma.$transaction(async (tx) => {
    // 4. Check for duplicate schedules for the exact time
    const conflict = await findConflictingInterview(application.id, new Date(data.scheduledAt), tx);
    if (conflict) {
      throw new AppError("An interview is already scheduled for this application at the requested time", 409);
    }

    // 5. Create the Interview
    const interview = await createInterview({
      applicationId: application.id,
      companyId: application.job.company.id,
      candidateId: application.candidate.id,
      jobId: application.jobId,
      scheduledById: user.id,
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
      performedBy: user.id,
      action: "INTERVIEW_SCHEDULED",
      metadata: { interviewId: interview.id, title: interview.title, type: interview.type, scheduledAt: interview.scheduledAt },
    }, tx);

    await createActivityLog({
      userId: application.candidate.id,
      companyId: application.job.company.id,
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
};
