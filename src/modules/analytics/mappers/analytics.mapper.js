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

export const toTimeToHireDTO = (metrics, stageMetrics, bottlenecks) => {
  if (!metrics) return null;

  return {
    overview: {
      averageTimeToHireDays: metrics.averageTimeToHire || 0,
      medianTimeToHireDays: metrics.medianTimeToHire || 0,
      fastestHireDays: metrics.fastestHire || 0,
      slowestHireDays: metrics.slowestHire || 0,
      totalCompletedHires: metrics.totalCompletedHires || 0
    },
    stageDurations: {
      screening: stageMetrics?.screening || { averageDays: 0, minimumDays: 0, maximumDays: 0 },
      interview: stageMetrics?.interview || { averageDays: 0, minimumDays: 0, maximumDays: 0 },
      offer: stageMetrics?.offer || { averageDays: 0, minimumDays: 0, maximumDays: 0 },
      hire: stageMetrics?.hire || { averageDays: 0, minimumDays: 0, maximumDays: 0 }
    },
    bottlenecks: {
      longestStage: bottlenecks?.longestStage || "None",
      averageDelayDays: bottlenecks?.averageDelay || 0,
      highestDropOffStage: bottlenecks?.highestDropOffStage || "Unknown"
    }
  };
};

export const toHiringTrendDTO = (trends) => {
  if (!trends) return null;

  return {
    trends: {
      daily: trends.daily || [],
      weekly: trends.weekly || [],
      monthly: trends.monthly || [],
      yearly: trends.yearly || []
    }
  };
};

export const toSourceAnalyticsDTO = (sourceMetrics) => {
  if (!sourceMetrics) return null;

  const result = {};
  for (const [source, data] of Object.entries(sourceMetrics)) {
    result[source] = {
      counts: {
        totalJobs: data.counts.totalJobs || 0,
        applications: {
          total: data.counts.totalApplications || 0,
          shortlisted: data.counts.shortlistedApplications || 0,
        },
        interviews: {
          scheduled: data.counts.interviewScheduled || 0,
          completed: data.counts.interviewCompleted || 0,
        },
        offers: {
          created: data.counts.offersCreated || 0,
          sent: data.counts.offersSent || 0,
          accepted: data.counts.offersAccepted || 0,
        },
        outcomes: {
          hired: data.counts.hired || 0,
          rejected: data.counts.rejected || 0,
        }
      },
      conversionRates: {
        applicationConversionPercentage: data.conversion.applicationConversionPercentage || 0,
        interviewConversionPercentage: data.conversion.interviewConversionPercentage || 0,
        offerAcceptancePercentage: data.conversion.offerAcceptancePercentage || 0,
        hiringSuccessPercentage: data.conversion.hiringSuccessPercentage || 0,
        overallFunnelConversionPercentage: data.conversion.overallFunnelConversionPercentage || 0
      },
      quality: {
        averageTimeToHireDays: data.quality.averageTimeToHireDays || 0,
        averageInterviewScore: data.quality.averageInterviewScore, // Will be null
        averageCandidateRating: data.quality.averageCandidateRating, // Will be null
        averageOfferAcceptancePercentage: data.quality.averageOfferAcceptancePercentage || 0
      }
    };
  }

  return result;
};

export const toSourceSummaryDTO = (summary) => {
  if (!summary) return null;

  return {
    bestPerformingSource: summary.bestPerformingSource || "None",
    highestHiringSource: summary.highestHiringSource || "None",
    highestOfferAcceptanceSource: summary.highestOfferAcceptanceSource || "None",
    highestInterviewConversionSource: summary.highestInterviewConversionSource || "None",
    lowestPerformingSource: summary.lowestPerformingSource || "None"
  };
};

export const toJobAnalyticsDTO = (jobMetrics) => {
  if (!jobMetrics) return null;

  return {
    jobDetails: {
      id: jobMetrics.jobDetails.id,
      title: jobMetrics.jobDetails.title,
      department: jobMetrics.jobDetails.department,
      status: jobMetrics.jobDetails.status,
      publishedAt: jobMetrics.jobDetails.publishedAt,
      closedAt: jobMetrics.jobDetails.closedAt
    },
    counts: {
      applications: {
        total: jobMetrics.counts.totalApplications || 0,
        shortlisted: jobMetrics.counts.shortlistedApplications || 0,
      },
      interviews: {
        scheduled: jobMetrics.counts.interviewScheduled || 0,
        completed: jobMetrics.counts.interviewCompleted || 0,
      },
      offers: {
        created: jobMetrics.counts.offersCreated || 0,
        sent: jobMetrics.counts.offersSent || 0,
        accepted: jobMetrics.counts.offersAccepted || 0,
      },
      outcomes: {
        hired: jobMetrics.counts.hired || 0,
        rejected: jobMetrics.counts.rejected || 0,
      }
    },
    conversionRates: {
      applicationConversionPercentage: jobMetrics.conversion.applicationConversionPercentage || 0,
      interviewConversionPercentage: jobMetrics.conversion.interviewConversionPercentage || 0,
      offerAcceptancePercentage: jobMetrics.conversion.offerAcceptancePercentage || 0,
      hiringSuccessPercentage: jobMetrics.conversion.hiringSuccessPercentage || 0,
      overallJobConversionPercentage: jobMetrics.conversion.overallJobConversionPercentage || 0
    },
    timeMetrics: {
      averageTimeToFillDays: jobMetrics.timeMetrics.averageTimeToFillDays,
      averageTimeToHireDays: jobMetrics.timeMetrics.averageTimeToHireDays,
      fastestHireDays: jobMetrics.timeMetrics.fastestHireDays,
      slowestHireDays: jobMetrics.timeMetrics.slowestHireDays,
      averageInterviewDuration: jobMetrics.timeMetrics.averageInterviewDuration,
      averageOfferAcceptanceTime: jobMetrics.timeMetrics.averageOfferAcceptanceTime
    }
  };
};

export const toJobRankingDTO = (rankedJobs) => {
  if (!rankedJobs) return [];

  return rankedJobs.map((job, index) => ({
    rank: index + 1,
    id: job.jobDetails.id,
    title: job.jobDetails.title,
    department: job.jobDetails.department,
    status: job.jobDetails.status,
    totalApplications: job.counts.totalApplications,
    totalHires: job.counts.hired,
    overallConversionPercentage: job.conversion.overallJobConversionPercentage
  }));
};

export const toJobsDashboardSummaryDTO = (summary) => {
  if (!summary) return null;

  return {
    totalJobs: summary.totalJobs || 0,
    activeJobs: summary.activeJobs || 0,
    closedJobs: summary.closedJobs || 0,
    bestPerformingJob: summary.bestPerformingJob || "None",
    worstPerformingJob: summary.worstPerformingJob || "None",
    averageApplicationsPerJob: summary.averageApplicationsPerJob || 0,
    averageHiresPerJob: summary.averageHiresPerJob || 0
  };
};

export const toRecruiterAnalyticsDTO = (recruiterMetrics) => {
  if (!recruiterMetrics) return null;

  return {
    recruiterDetails: {
      id: recruiterMetrics.recruiterDetails.id,
      name: recruiterMetrics.recruiterDetails.name,
      department: recruiterMetrics.recruiterDetails.department
    },
    counts: {
      jobsManaged: recruiterMetrics.counts.jobsManaged,
      applicationsReviewed: recruiterMetrics.counts.applicationsReviewed,
      applicationsShortlisted: recruiterMetrics.counts.applicationsShortlisted,
      interviewsScheduled: recruiterMetrics.counts.interviewsScheduled,
      interviewsCompleted: recruiterMetrics.counts.interviewsCompleted,
      feedbackSubmitted: recruiterMetrics.counts.feedbackSubmitted,
      offersCreated: recruiterMetrics.counts.offersCreated,
      offersSent: recruiterMetrics.counts.offersSent,
      offersAccepted: recruiterMetrics.counts.offersAccepted,
      successfulHires: recruiterMetrics.counts.successfulHires,
      rejectedCandidates: recruiterMetrics.counts.rejectedCandidates
    },
    performance: {
      applicationReviewRatePercentage: recruiterMetrics.performance.applicationReviewRatePercentage,
      interviewCompletionRatePercentage: recruiterMetrics.performance.interviewCompletionRatePercentage,
      offerAcceptanceRatePercentage: recruiterMetrics.performance.offerAcceptanceRatePercentage,
      hiringSuccessRatePercentage: recruiterMetrics.performance.hiringSuccessRatePercentage,
      averageTimeToHireDays: recruiterMetrics.performance.averageTimeToHireDays,
      averageCandidateRating: recruiterMetrics.performance.averageCandidateRating,
      averageInterviewRating: recruiterMetrics.performance.averageInterviewRating,
      averageFeedbackRating: recruiterMetrics.performance.averageFeedbackRating
    }
  };
};

export const toRecruiterRankingDTO = (rankedRecruiters) => {
  if (!rankedRecruiters) return [];

  return rankedRecruiters.map((recruiter, index) => ({
    rank: index + 1,
    id: recruiter.recruiterDetails.id,
    name: recruiter.recruiterDetails.name,
    department: recruiter.recruiterDetails.department,
    successfulHires: recruiter.counts.successfulHires,
    offerAcceptanceRatePercentage: recruiter.performance.offerAcceptanceRatePercentage,
    interviewCompletionRatePercentage: recruiter.performance.interviewCompletionRatePercentage,
    overallScore: recruiter.performance.overallScore
  }));
};

export const toRecruiterSummaryDTO = (summary) => {
  if (!summary) return null;

  return {
    topRecruiter: summary.topRecruiter || "None",
    lowestPerformingRecruiter: summary.lowestPerformingRecruiter || "None",
    averageHiresPerRecruiter: summary.averageHiresPerRecruiter || 0,
    averageInterviewsPerRecruiter: summary.averageInterviewsPerRecruiter || 0,
    averageOffersPerRecruiter: summary.averageOffersPerRecruiter || 0
  };
};
