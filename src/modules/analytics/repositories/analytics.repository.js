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
