import AppError from "../../../utils/AppError.js";
import { findApplicationByIdAndCandidateId, withdrawApplication } from "../repositories/application.repository.js";
import { isTransitionAllowed } from "../../shared/services/applicationStatusTransition.service.js";
import { verifyCandidateOwnership } from "../../shared/services/verifyCandidateOwnership.service.js";
import { logApplicationActivity } from "../../activity/services/activity.service.js";
import prisma from "../../../config/prisma.js";

// We need a raw fetcher without the candidate filter to use verifyCandidateOwnership.
// But since verifyCandidateOwnership takes a fetchFn, we can provide one inline.
const fetchApplicationForOwnership = async (id) => {
  return prisma.application.findUnique({ 
    where: { id },
    include: {
      job: {
        select: { companyId: true, title: true }
      }
    }
  });
};

export const withdrawApplicationService = async (applicationId, candidateId) => {
  // 1. Fetch application and ensure it belongs to the candidate
  const application = await verifyCandidateOwnership(
    applicationId,
    candidateId,
    fetchApplicationForOwnership,
    "Application"
  );

  // 2. Check if the status allows withdrawal
  isTransitionAllowed(application.status, "WITHDRAWN");

  // 3. Perform withdrawal & logging in a transaction
  const updatedApplication = await prisma.$transaction(async (tx) => {
    const app = await withdrawApplication(applicationId, tx);

    await logApplicationActivity({
      applicationId: app.id,
      performedBy: candidateId,
      action: "APPLICATION_WITHDRAWN",
      oldStatus: application.status,
      newStatus: "WITHDRAWN",
      metadata: { reason: "Candidate withdrew application" },
    }, tx);

    // Track reusable ActivityLog for dashboards
    const { createActivityLog } = await import("../../activity/services/activityLog.service.js");
    await createActivityLog({
      userId: candidateId,
      companyId: application.job.companyId,
      applicationId: app.id,
      jobId: application.jobId,
      type: "APPLICATION_WITHDRAWN",
      title: "Application Withdrawn",
      description: `You withdrew your application.`,
      metadata: null,
    }, tx);

    return app;
  });

  return updatedApplication;
};
