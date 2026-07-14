import { APPLICATION_STATUS } from "../../shared/constants/applicationStatus.constants.js";

/**
 * Transforms grouped status counts and recent applications into a standardized Candidate Dashboard DTO.
 */
export const toCandidateDashboard = (statusCounts, recentApps) => {
  const overview = {
    totalApplications: 0,
    activeApplications: 0,
    interviewInvites: 0,
    offersReceived: 0,
    rejectedApplications: 0,
    withdrawnApplications: 0,
  };

  // Map raw grouped counts into overview structure
  statusCounts.forEach((group) => {
    const status = group.status;
    const count = group._count.id;
    
    overview.totalApplications += count;

    if (
      status === APPLICATION_STATUS.APPLIED ||
      status === APPLICATION_STATUS.SCREENING ||
      status === APPLICATION_STATUS.SHORTLISTED ||
      status === APPLICATION_STATUS.INTERVIEW ||
      status === APPLICATION_STATUS.OFFERED
    ) {
      overview.activeApplications += count;
    }

    if (status === APPLICATION_STATUS.INTERVIEW) {
      overview.interviewInvites += count;
    }

    if (status === APPLICATION_STATUS.OFFERED) {
      overview.offersReceived += count;
    }

    if (status === APPLICATION_STATUS.REJECTED) {
      overview.rejectedApplications += count;
    }

    if (status === APPLICATION_STATUS.WITHDRAWN) {
      overview.withdrawnApplications += count;
    }
  });

  const recentApplications = recentApps.map((app) => ({
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt,
    job: app.job
      ? {
          id: app.job.id,
          title: app.job.title,
        }
      : undefined,
    company: app.job?.company
      ? {
          id: app.job.company.id,
          name: app.job.company.name,
          logo: app.job.company.logo,
        }
      : undefined,
  }));

  return {
    overview,
    recentApplications,
  };
};
