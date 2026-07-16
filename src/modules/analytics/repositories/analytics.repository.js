import prisma from "../../../config/prisma.js";

const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) {
    filter.gte = new Date(startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return Object.keys(filter).length > 0 ? filter : undefined;
};

export const getFunnelCounts = async (companyId, filters = {}) => {
  const { startDate, endDate, jobId, department } = filters;

  const dateFilter = buildDateFilter(startDate, endDate);
  
  const jobFilter = {
    companyId,
    ...(dateFilter && { createdAt: dateFilter }),
    ...(department && { department })
  };

  const appJobFilter = {
    companyId,
    ...(jobId && { id: jobId }),
    ...(department && { department })
  };

  const applicationFilter = {
    job: appJobFilter,
    ...(dateFilter && { createdAt: dateFilter })
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
    prisma.job.count({ where: jobFilter }),
    
    prisma.application.count({ where: applicationFilter }),
    
    prisma.application.count({ 
      where: { 
        ...applicationFilter,
        status: { in: ["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"] }
      } 
    }),
    
    prisma.interview.count({
      where: {
        companyId,
        job: appJobFilter,
        ...(dateFilter && { createdAt: dateFilter })
      }
    }),
    
    prisma.interview.count({
      where: {
        companyId,
        job: appJobFilter,
        status: "COMPLETED",
        ...(dateFilter && { createdAt: dateFilter })
      }
    }),

    prisma.offer.count({
      where: {
        companyId,
        job: appJobFilter,
        ...(dateFilter && { createdAt: dateFilter })
      }
    }),

    prisma.offer.count({
      where: {
        companyId,
        job: appJobFilter,
        status: { in: ["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"] },
        ...(dateFilter && { sentAt: dateFilter })
      }
    }),

    prisma.offer.count({
      where: {
        companyId,
        job: appJobFilter,
        status: "ACCEPTED",
        ...(dateFilter && { acceptedAt: dateFilter })
      }
    }),

    prisma.application.count({
      where: {
        ...applicationFilter,
        status: "HIRED"
      }
    }),

    prisma.application.count({
      where: {
        ...applicationFilter,
        status: "REJECTED"
      }
    })
  ]);

  return {
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
  };
};

export const getDashboardCounts = async (companyId, filters = {}) => {
  const { startDate, endDate, jobId, department } = filters;

  const dateFilter = buildDateFilter(startDate, endDate);
  
  const appJobFilter = {
    companyId,
    ...(jobId && { id: jobId }),
    ...(department && { department })
  };

  const jobFilter = {
    companyId,
    ...(department && { department }),
    ...(dateFilter && { createdAt: dateFilter })
  };

  const [
    totalJobs,
    activeJobs,
    closedJobs,
    totalApplications,
    totalInterviews,
    totalOffers,
    totalHires
  ] = await Promise.all([
    prisma.job.count({ where: jobFilter }),
    prisma.job.count({ where: { ...jobFilter, status: "PUBLISHED" } }),
    prisma.job.count({ where: { ...jobFilter, status: "CLOSED" } }),
    
    prisma.application.count({
      where: {
        job: appJobFilter,
        ...(dateFilter && { createdAt: dateFilter })
      }
    }),
    
    prisma.interview.count({
      where: {
        companyId,
        job: appJobFilter,
        ...(dateFilter && { createdAt: dateFilter })
      }
    }),

    prisma.offer.count({
      where: {
        companyId,
        job: appJobFilter,
        ...(dateFilter && { createdAt: dateFilter })
      }
    }),

    prisma.application.count({
      where: {
        job: appJobFilter,
        status: "HIRED",
        ...(dateFilter && { createdAt: dateFilter })
      }
    })
  ]);

  return {
    totalJobs,
    activeJobs,
    closedJobs,
    totalApplications,
    totalInterviews,
    totalOffers,
    totalHires
  };
};

export const getHiredApplicationsData = async (companyId, filters = {}) => {
  const { startDate, endDate, jobId, department } = filters;
  const dateFilter = buildDateFilter(startDate, endDate);

  const applicationFilter = {
    job: {
      companyId,
      ...(jobId && { id: jobId }),
      ...(department && { department })
    },
    status: "HIRED",
    // We filter by date filter on appliedAt if provided
    ...(dateFilter && { appliedAt: dateFilter })
  };

  return prisma.application.findMany({
    where: applicationFilter,
    select: {
      id: true,
      appliedAt: true,
      updatedAt: true,
      offer: {
        select: {
          acceptedAt: true
        }
      },
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
  const { startDate, endDate, jobId, department } = filters;
  const dateFilter = buildDateFilter(startDate, endDate);

  return prisma.applicationActivity.findMany({
    where: {
      application: {
        job: {
          companyId,
          ...(jobId && { id: jobId }),
          ...(department && { department })
        },
        ...(dateFilter && { appliedAt: dateFilter })
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
  const { startDate, endDate, jobId, department, source } = filters;
  const dateFilter = buildDateFilter(startDate, endDate);

  return prisma.application.findMany({
    where: {
      job: {
        companyId,
        ...(jobId && { id: jobId }),
        ...(department && { department })
      },
      ...(source && { source }),
      ...(dateFilter && { createdAt: dateFilter })
    },
    select: {
      id: true,
      source: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      interviews: {
        select: {
          id: true,
          status: true
        }
      },
      offer: {
        select: {
          id: true,
          status: true,
          sentAt: true,
          acceptedAt: true
        }
      },
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
  const { startDate, endDate, department, employmentType, status } = filters;
  const dateFilter = buildDateFilter(startDate, endDate);

  return prisma.job.findMany({
    where: {
      companyId,
      ...(singleJobId && { id: singleJobId }),
      ...(department && { department }),
      ...(employmentType && { employmentType }),
      ...(status && { status }),
      ...(dateFilter && { createdAt: dateFilter })
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
          interviews: {
            select: {
              id: true,
              status: true
            }
          },
          offer: {
            select: {
              id: true,
              status: true,
              sentAt: true,
              acceptedAt: true
            }
          },
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
  const { startDate, endDate, department, jobId, status } = filters;
  const dateFilter = buildDateFilter(startDate, endDate);

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
    // Only add if not already present
    if (!recruiters.find(r => r.id === owner.owner.id)) {
      recruiters.push({ id: owner.owner.id, name: owner.owner.name, designation: "Company Admin" });
    }
  }

  const recruiterIds = recruiters.map(r => r.id);

  // Job Filters
  const jobWhere = {
    companyId,
    ...(jobId && { id: jobId }),
    ...(department && { department }),
    ...(status && { status })
  };

  // Fetch metrics data
  const jobs = await prisma.job.findMany({
    where: { ...jobWhere, createdBy: { in: recruiterIds }, ...(dateFilter && { createdAt: dateFilter }) },
    select: { id: true, createdBy: true }
  });

  const activities = await prisma.applicationActivity.findMany({
    where: { 
      application: { job: jobWhere },
      performedBy: { in: recruiterIds },
      ...(dateFilter && { createdAt: dateFilter })
    },
    select: { id: true, performedBy: true, action: true, newStatus: true }
  });

  const interviews = await prisma.interview.findMany({
    where: { 
      companyId, 
      ...(jobId && { jobId }),
      scheduledById: { in: recruiterIds }, 
      ...(dateFilter && { createdAt: dateFilter }) 
    },
    select: { id: true, scheduledById: true, status: true }
  });

  const feedbacks = await prisma.interviewFeedback.findMany({
    where: { 
      interview: { companyId, ...(jobId && { jobId }) }, 
      interviewerId: { in: recruiterIds }, 
      ...(dateFilter && { createdAt: dateFilter }) 
    },
    select: { id: true, interviewerId: true, overallRating: true }
  });

  const offers = await prisma.offer.findMany({
    where: { 
      companyId, 
      ...(jobId && { jobId }),
      createdById: { in: recruiterIds }, 
      ...(dateFilter && { createdAt: dateFilter }) 
    },
    select: { id: true, createdById: true, status: true }
  });

  return { recruiters, jobs, activities, interviews, feedbacks, offers };
};
