import { APPLICATION_STATUS } from "../../shared/constants/applicationStatus.constants.js";

/**
 * Helper to map raw count aggregates into a standardized dictionary.
 */
const countByStatus = (statsArray) => {
  const counts = {};
  let total = 0;
  statsArray.forEach((group) => {
    const status = group.status;
    const count = group._count.id;
    counts[status] = count;
    total += count;
  });
  return { counts, total };
};

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
  const { counts, total } = countByStatus(statusCounts);
  
  overview.totalApplications = total;
  overview.activeApplications = 
    (counts[APPLICATION_STATUS.APPLIED] || 0) +
    (counts[APPLICATION_STATUS.SCREENING] || 0) +
    (counts[APPLICATION_STATUS.SHORTLISTED] || 0) +
    (counts[APPLICATION_STATUS.INTERVIEW] || 0) +
    (counts[APPLICATION_STATUS.OFFERED] || 0);
  
  overview.interviewInvites = counts[APPLICATION_STATUS.INTERVIEW] || 0;
  overview.offersReceived = counts[APPLICATION_STATUS.OFFERED] || 0;
  overview.rejectedApplications = counts[APPLICATION_STATUS.REJECTED] || 0;
  overview.withdrawnApplications = counts[APPLICATION_STATUS.WITHDRAWN] || 0;

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
  const { counts: jobCounts, total: totalJobs } = countByStatus(jobStats);
  overview.totalJobs = totalJobs;
  overview.activeJobs = jobCounts["PUBLISHED"] || 0;
  overview.closedJobs = jobCounts["CLOSED"] || 0;
  overview.draftJobs = jobCounts["DRAFT"] || 0;

  // 2. Map Application Stats
  const { counts: appCounts, total: totalApplicants } = countByStatus(appStats);
  overview.totalApplicants = totalApplicants;
  overview.shortlistedApplicants = appCounts[APPLICATION_STATUS.SHORTLISTED] || 0;
  overview.rejectedApplicants = appCounts[APPLICATION_STATUS.REJECTED] || 0;
  overview.interviewScheduled = appCounts[APPLICATION_STATUS.INTERVIEW] || 0;
  overview.offersSent = appCounts[APPLICATION_STATUS.OFFERED] || 0;
  overview.hiredCandidates = appCounts[APPLICATION_STATUS.HIRED] || 0;

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
  const { counts: rawCounts, total: totalApplications } = countByStatus(appStats);

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
