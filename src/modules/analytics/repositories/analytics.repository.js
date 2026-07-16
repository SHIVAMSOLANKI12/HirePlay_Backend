import prisma from "../../../config/prisma.js";

// --- REUSABLE FILTERS ---

export const buildDateFilter = (startDate, endDate, dateField = "createdAt") => {
  const filter = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return Object.keys(filter).length > 0 ? { [dateField]: filter } : undefined;
};

export const buildJobWhere = (companyId, filters) => {
  const { jobId, department, status, employmentType } = filters;
  return {
    companyId,
    ...(jobId && { id: jobId }),
    ...(department && { department }),
    ...(status && { status }),
    ...(employmentType && { employmentType })
  };
};

// --- DB OPTIMIZED QUERIES ---

export const getFunnelCounts = async (companyId, filters = {}) => {
  const jobWhere = buildJobWhere(companyId, filters);
  const createdDateFilter = buildDateFilter(filters.startDate, filters.endDate);
  
  const appWhere = {
    job: jobWhere,
    ...createdDateFilter
  };

  const [
    totalJobs,
    totalApplications,
    shortlistedApplications,
    interviewScheduled,
    interviewCompleted,
    offersCreated,
    offersSent,
    offersAccepted,
    hired,
    rejected
  ] = await Promise.all([
    prisma.job.count({ where: { ...jobWhere, ...createdDateFilter } }),
    prisma.application.count({ where: appWhere }),
    prisma.application.count({ where: { ...appWhere, status: { in: ["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"] } } }),
    prisma.interview.count({ where: { companyId, job: jobWhere, ...createdDateFilter } }),
    prisma.interview.count({ where: { companyId, job: jobWhere, status: "COMPLETED", ...createdDateFilter } }),
    prisma.offer.count({ where: { companyId, job: jobWhere, ...createdDateFilter } }),
    prisma.offer.count({ where: { companyId, job: jobWhere, status: { in: ["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"] }, ...buildDateFilter(filters.startDate, filters.endDate, "sentAt") } }),
    prisma.offer.count({ where: { companyId, job: jobWhere, status: "ACCEPTED", ...buildDateFilter(filters.startDate, filters.endDate, "acceptedAt") } }),
    prisma.application.count({ where: { ...appWhere, status: "HIRED" } }),
    prisma.application.count({ where: { ...appWhere, status: "REJECTED" } })
  ]);

  return { totalJobs, totalApplications, shortlistedApplications, interviewScheduled, interviewCompleted, offersCreated, offersSent, offersAccepted, hired, rejected };
};

export const getDashboardCounts = async (companyId, filters = {}) => {
  const jobWhere = buildJobWhere(companyId, filters);
  const createdDateFilter = buildDateFilter(filters.startDate, filters.endDate);
  
  const [
    totalJobs,
    activeJobs,
    closedJobs,
    totalApplications,
    totalInterviews,
    totalOffers,
    totalHires
  ] = await Promise.all([
    prisma.job.count({ where: { ...jobWhere, ...createdDateFilter } }),
    prisma.job.count({ where: { ...jobWhere, status: "PUBLISHED", ...createdDateFilter } }),
    prisma.job.count({ where: { ...jobWhere, status: "CLOSED", ...createdDateFilter } }),
    prisma.application.count({ where: { job: jobWhere, ...createdDateFilter } }),
    prisma.interview.count({ where: { companyId, job: jobWhere, ...createdDateFilter } }),
    prisma.offer.count({ where: { companyId, job: jobWhere, ...createdDateFilter } }),
    prisma.application.count({ where: { job: jobWhere, status: "HIRED", ...createdDateFilter } })
  ]);

  return { totalJobs, activeJobs, closedJobs, totalApplications, totalInterviews, totalOffers, totalHires };
};

export const getHiredApplicationsData = async (companyId, filters = {}) => {
  const jobWhere = buildJobWhere(companyId, filters);
  const appliedDateFilter = buildDateFilter(filters.startDate, filters.endDate, "appliedAt");

  return prisma.application.findMany({
    where: {
      job: jobWhere,
      status: "HIRED",
      ...appliedDateFilter
    },
    select: {
      id: true,
      appliedAt: true,
      updatedAt: true,
      offer: { select: { acceptedAt: true } },
      activities: {
        where: { newStatus: "HIRED" },
        select: { createdAt: true },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });
};

export const getStageTransitionData = async (companyId, filters = {}) => {
  const jobWhere = buildJobWhere(companyId, filters);
  const dateFilter = buildDateFilter(filters.startDate, filters.endDate, "appliedAt");

  return prisma.applicationActivity.findMany({
    where: {
      application: {
        job: jobWhere,
        ...dateFilter
      },
      newStatus: { not: null }
    },
    select: {
      applicationId: true,
      newStatus: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
};

export const getApplicationsWithSourceData = async (companyId, filters = {}) => {
  const jobWhere = buildJobWhere(companyId, filters);
  const createdDateFilter = buildDateFilter(filters.startDate, filters.endDate);

  // We still need the nested select here because source analytics bucket service calculates conversion rates
  // To avoid N+1, we use select precisely
  return prisma.application.findMany({
    where: {
      job: jobWhere,
      ...(filters.source && { source: filters.source }),
      ...createdDateFilter
    },
    select: {
      id: true,
      source: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      interviews: { select: { id: true, status: true } },
      offer: { select: { id: true, status: true, sentAt: true, acceptedAt: true } },
      activities: {
        where: { newStatus: "HIRED" },
        select: { createdAt: true },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });
};

export const getJobsAnalyticsData = async (companyId, filters = {}, singleJobId = null) => {
  const jobWhere = buildJobWhere(companyId, filters);
  if (singleJobId) jobWhere.id = singleJobId;
  const createdDateFilter = buildDateFilter(filters.startDate, filters.endDate);

  return prisma.job.findMany({
    where: {
      ...jobWhere,
      ...createdDateFilter
    },
    select: {
      id: true,
      title: true,
      department: true,
      status: true,
      publishedAt: true,
      closedAt: true,
      applications: {
        select: {
          id: true,
          status: true,
          appliedAt: true,
          updatedAt: true,
          interviews: { select: { id: true, status: true } },
          offer: { select: { id: true, status: true, sentAt: true, acceptedAt: true } },
          activities: {
            where: { newStatus: "HIRED" },
            select: { createdAt: true },
            take: 1,
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });
};

export const getRecruiterAnalyticsData = async (companyId, filters = {}, recruiterId = null) => {
  const jobWhere = buildJobWhere(companyId, filters);
  const createdDateFilter = buildDateFilter(filters.startDate, filters.endDate);

  // Fetch Recruiters (HRs and Company Admin)
  const hrs = await prisma.hR.findMany({
    where: { companyId, ...(recruiterId && { id: recruiterId }) },
    select: { id: true, firstName: true, lastName: true, designation: true }
  });

  const owner = await prisma.company.findUnique({
    where: { id: companyId },
    select: { owner: { select: { id: true, name: true } } }
  });

  const recruiters = [...hrs.map(hr => ({ id: hr.id, name: `${hr.firstName} ${hr.lastName}`, designation: hr.designation }))];
  if (owner?.owner && (!recruiterId || owner.owner.id === recruiterId)) {
    if (!recruiters.find(r => r.id === owner.owner.id)) {
      recruiters.push({ id: owner.owner.id, name: owner.owner.name, designation: "Company Admin" });
    }
  }

  const recruiterIds = recruiters.map(r => r.id);

  const jobs = await prisma.job.findMany({
    where: { ...jobWhere, createdBy: { in: recruiterIds }, ...createdDateFilter },
    select: { id: true, createdBy: true }
  });

  const activities = await prisma.applicationActivity.findMany({
    where: { 
      application: { job: jobWhere },
      performedBy: { in: recruiterIds },
      ...createdDateFilter
    },
    select: { id: true, performedBy: true, action: true, newStatus: true }
  });

  const interviews = await prisma.interview.findMany({
    where: { 
      companyId, 
      ...(filters.jobId && { jobId: filters.jobId }),
      scheduledById: { in: recruiterIds }, 
      ...createdDateFilter 
    },
    select: { id: true, scheduledById: true, status: true }
  });

  const feedbacks = await prisma.interviewFeedback.findMany({
    where: { 
      interview: { companyId, ...(filters.jobId && { jobId: filters.jobId }) }, 
      interviewerId: { in: recruiterIds }, 
      ...createdDateFilter 
    },
    select: { id: true, interviewerId: true, overallRating: true }
  });

  const offers = await prisma.offer.findMany({
    where: { 
      companyId, 
      ...(filters.jobId && { jobId: filters.jobId }),
      createdById: { in: recruiterIds }, 
      ...createdDateFilter 
    },
    select: { id: true, createdById: true, status: true }
  });

  return { recruiters, jobs, activities, interviews, feedbacks, offers };
};
