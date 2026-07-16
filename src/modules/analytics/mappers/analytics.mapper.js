export const toHiringFunnelDTO = (metrics) => {
  if (!metrics) return null;

  return {
    counts: {
      totalJobs: metrics.totalJobs || 0,
      applications: {
        total: metrics.totalApplications || 0,
        shortlisted: metrics.shortlistedApplications || 0,
      },
      interviews: {
        scheduled: metrics.interviewScheduled || 0,
        completed: metrics.interviewCompleted || 0,
      },
      offers: {
        created: metrics.offersCreated || 0,
        sent: metrics.offersSent || 0,
        accepted: metrics.offersAccepted || 0,
      },
      outcomes: {
        hired: metrics.hired || 0,
        rejected: metrics.rejected || 0,
      }
    },
    conversionRates: {
      applicationConversionPercentage: metrics.applicationConversionRate || 0,
      interviewConversionPercentage: metrics.interviewConversionRate || 0,
      offerAcceptancePercentage: metrics.offerAcceptanceRate || 0,
      hiringSuccessPercentage: metrics.hiringSuccessRate || 0,
      overallFunnelConversionPercentage: metrics.overallFunnelConversionRate || 0
    }
  };
};

export const toDashboardSummaryDTO = (metrics) => {
  if (!metrics) return null;

  return {
    jobs: {
      total: metrics.totalJobs || 0,
      active: metrics.activeJobs || 0,
      closed: metrics.closedJobs || 0,
    },
    recruitment: {
      totalApplications: metrics.totalApplications || 0,
      totalInterviews: metrics.totalInterviews || 0,
      totalOffers: metrics.totalOffers || 0,
      totalHires: metrics.totalHires || 0,
    },
    performance: {
      averageTimeToHireDays: metrics.averageTimeToHire || 0
    }
  };
};
