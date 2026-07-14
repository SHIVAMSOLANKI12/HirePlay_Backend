import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { findApplicationById, updateApplicationStatus } from "../repositories/application.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { isTransitionAllowed } from "../../shared/services/applicationStatusTransition.service.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import { APPLICATION_STATUS } from "../../shared/constants/applicationStatus.constants.js";

// Event Hooks (Placeholders for future implementation)
const onStatusChanged = async (application, newStatus, tx) => {};
const onInterviewScheduled = async (application, metadata, tx) => {};
const onOfferSent = async (application, metadata, tx) => {};

export const updateApplicationStatusWorkflow = async (user, applicationId, requestedStatus, metadata = null, externalTx = null) => {
  // 1. Fetch Application
  const application = await findApplicationById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify Recruiter Access (Job ownership implicitly verifies Application ownership)
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Validate Status Transition
  isTransitionAllowed(application.status, requestedStatus);

  const executeLogic = async (tx) => {
    // 4a. Update Application Status
    const app = await updateApplicationStatus(applicationId, requestedStatus, tx);

    // 4b. Create ApplicationActivity
    await logApplicationActivity({
      applicationId: app.id,
      performedBy: user.id,
      action: "STATUS_CHANGED",
      oldStatus: application.status,
      newStatus: requestedStatus,
      metadata,
    }, tx);

    // Track reusable ActivityLog for dashboards
    const { createActivityLog } = await import("../../activity/services/activityLog.service.js");
    const statusToTypeMap = {
      [APPLICATION_STATUS.SCREENING]: "APPLICATION_REVIEWED",
      [APPLICATION_STATUS.SHORTLISTED]: "APPLICATION_SHORTLISTED",
      [APPLICATION_STATUS.INTERVIEW]: "INTERVIEW_SCHEDULED",
      [APPLICATION_STATUS.OFFERED]: "OFFER_SENT",
      [APPLICATION_STATUS.HIRED]: "HIRED",
      [APPLICATION_STATUS.REJECTED]: "APPLICATION_REJECTED",
    };
    
    if (statusToTypeMap[requestedStatus]) {
      await createActivityLog({
        userId: application.candidateId,
        companyId: application.job.company.id,
        applicationId: app.id,
        jobId: application.jobId,
        type: statusToTypeMap[requestedStatus],
        title: `Status Updated to ${requestedStatus}`,
        description: `Application status changed to ${requestedStatus}.`,
        metadata: metadata || null,
      }, tx);
    }

    // 5. Trigger Event Hooks (Placeholders)
    await onStatusChanged(app, requestedStatus, tx);
    
    if (requestedStatus === APPLICATION_STATUS.INTERVIEW) {
      await onInterviewScheduled(app, metadata, tx);
    } else if (requestedStatus === APPLICATION_STATUS.OFFERED) {
      await onOfferSent(app, metadata, tx);
    }

    return app;
  };

  // 6. Use external transaction if provided, else create a new one
  if (externalTx) {
    return await executeLogic(externalTx);
  } else {
    return await prisma.$transaction(executeLogic);
  }
};
