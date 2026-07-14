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

/**
 * Transforms grouped stats and recent data into a standardized Recruiter Dashboard DTO.
 */
export const toRecruiterDashboard = (jobStats, appStats, recentJobsRaw, recentAppsRaw) => {
  const overview = {
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    draftJobs: 0,
    totalApplicants: 0,
    shortlistedApplicants: 0,
    rejectedApplicants: 0,
    interviewScheduled: 0,
    offersSent: 0,
    hiredCandidates: 0,
  };

  // 1. Map Job Stats
  jobStats.forEach((group) => {
    const status = group.status;
    const count = group._count.id;

    overview.totalJobs += count;

    if (status === "PUBLISHED") overview.activeJobs += count;
    if (status === "CLOSED") overview.closedJobs += count;
    if (status === "DRAFT") overview.draftJobs += count;
  });

  // 2. Map Application Stats
  appStats.forEach((group) => {
    const status = group.status;
    const count = group._count.id;

    overview.totalApplicants += count;

    if (status === APPLICATION_STATUS.SHORTLISTED) overview.shortlistedApplicants += count;
    if (status === APPLICATION_STATUS.REJECTED) overview.rejectedApplicants += count;
    if (status === APPLICATION_STATUS.INTERVIEW) overview.interviewScheduled += count;
    if (status === APPLICATION_STATUS.OFFERED) overview.offersSent += count;
    if (status === APPLICATION_STATUS.HIRED) overview.hiredCandidates += count;
  });

  // 3. Map Recent Jobs
  const recentJobs = recentJobsRaw.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    createdAt: job.createdAt,
  }));

  // 4. Map Recent Applications
  const recentApplications = recentAppsRaw.map((app) => ({
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt,
    candidate: app.candidate
      ? {
          id: app.candidate.id,
          name: app.candidate.name,
        }
      : undefined,
    job: app.job
      ? {
          id: app.job.id,
          title: app.job.title,
        }
      : undefined,
  }));

  return {
    overview,
    recentJobs,
    recentApplications,
  };
};

/**
 * Transforms grouped stats into the Hiring Funnel Analytics DTO.
 */
export const toHiringFunnel = (appStats) => {
  let totalApplications = 0;

  // Track raw counts by Prisma status
  const rawCounts = {};
  appStats.forEach((group) => {
    const status = group.status;
    const count = group._count.id;
    rawCounts[status] = count;
    totalApplications += count;
  });

  // Map requested funnel stages to Prisma statuses
  const funnelStages = [
    { display: "APPLIED", prisma: APPLICATION_STATUS.APPLIED },
    { display: "REVIEWED", prisma: APPLICATION_STATUS.SCREENING },
    { display: "SHORTLISTED", prisma: APPLICATION_STATUS.SHORTLISTED },
    { display: "INTERVIEW_SCHEDULED", prisma: APPLICATION_STATUS.INTERVIEW },
    { display: "OFFER_SENT", prisma: APPLICATION_STATUS.OFFERED },
    { display: "HIRED", prisma: APPLICATION_STATUS.HIRED },
    { display: "REJECTED", prisma: APPLICATION_STATUS.REJECTED },
    { display: "WITHDRAWN", prisma: APPLICATION_STATUS.WITHDRAWN },
  ];

  const funnel = funnelStages.map((stage) => {
    const count = rawCounts[stage.prisma] || 0;
    
    let percentage = 0;
    if (totalApplications > 0) {
      percentage = Number(((count / totalApplications) * 100).toFixed(2));
    }

    return {
      stage: stage.display,
      count,
      percentage,
    };
  });

  return {
    summary: {
      totalApplications,
    },
    funnel,
  };
};

/**
 * Transforms monthly timestamps and status counts into the Monthly Analytics DTO.
 */
export const toMonthlyAnalytics = (year, appsRaw, jobsRaw, statusRaw) => {
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize buckets with 0 counts for all 12 months
  const applicationsByMonth = monthLabels.map(month => ({ month, count: 0 }));
  const jobsByMonth = monthLabels.map(month => ({ month, count: 0 }));

  // Bucket applications by extracting the 0-indexed month
  appsRaw.forEach((app) => {
    if (app.appliedAt) {
      const monthIndex = app.appliedAt.getMonth();
      applicationsByMonth[monthIndex].count += 1;
    }
  });

  // Bucket jobs by extracting the 0-indexed month
  jobsRaw.forEach((job) => {
    if (job.createdAt) {
      const monthIndex = job.createdAt.getMonth();
      jobsByMonth[monthIndex].count += 1;
    }
  });

  // Map status counts
  const statusDistribution = statusRaw.map(group => ({
    status: group.status,
    count: group._count.id
  }));

  return {
    year: Number(year),
    applicationsByMonth,
    jobsByMonth,
    statusDistribution,
  };
};

/**
 * Formats activity logs for Candidate Dashboard.
 */
export const toCandidateActivityList = (activities) => {
  return activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    createdAt: activity.createdAt,
    job: activity.job ? {
      id: activity.job.id,
      title: activity.job.title,
    } : null,
    company: activity.company ? {
      id: activity.company.id,
      name: activity.company.name,
      logo: activity.company.logo,
    } : null,
  }));
};

/**
 * Formats activity logs for Recruiter Dashboard.
 */
export const toRecruiterActivityList = (activities) => {
  return activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    createdAt: activity.createdAt,
    candidate: activity.user ? {
      id: activity.user.id,
      name: activity.user.name,
    } : null,
    job: activity.job ? {
      id: activity.job.id,
      title: activity.job.title,
    } : null,
  }));
};
