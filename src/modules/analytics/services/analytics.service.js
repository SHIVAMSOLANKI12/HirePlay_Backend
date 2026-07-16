import prisma from "../../../config/prisma.js";
import { 
  calculatePercentage, 
  getDiffInDays, 
  calculateFunnelRates, 
  calculateDurationMetrics,
  calculateRecruiterScore 
} from "./analytics.calculation.service.js";

export const getCompanyIdForUser = async (user) => {
  if (user.role === "COMPANY_ADMIN") {
    const company = await prisma.company.findFirst({ where: { ownerId: user.id } });
    return company?.id;
  }
  if (user.role === "HR") {
    const hr = await prisma.hR.findUnique({ where: { id: user.id } });
    return hr?.companyId;
  }
  return null;
};

// --- Funnel & Dashboard ---

export const calculateFunnelMetrics = (counts) => {
  const rates = calculateFunnelRates(counts);
  return {
    ...counts,
    ...rates
  };
};

export const calculateDashboardMetrics = (counts) => {
  return {
    ...counts,
    averageTimeToHire: 0 // Placeholder
  };
};

// --- Time to Hire ---

export const calculateTimeToHireMetrics = (applications) => {
  if (!applications || applications.length === 0) {
    return {
      averageTimeToHire: 0,
      medianTimeToHire: 0,
      fastestHire: 0,
      slowestHire: 0,
      totalCompletedHires: 0
    };
  }

  const durations = applications.map(app => {
    let hireDate = app.updatedAt;
    if (app.offer?.acceptedAt) {
      hireDate = app.offer.acceptedAt;
    } else if (app.activities && app.activities.length > 0) {
      hireDate = app.activities[0].createdAt;
    }
    return getDiffInDays(new Date(app.appliedAt), new Date(hireDate));
  });

  const metrics = calculateDurationMetrics(durations);

  return {
    averageTimeToHire: metrics.averageDays,
    medianTimeToHire: metrics.medianDays,
    fastestHire: metrics.fastestDays,
    slowestHire: metrics.slowestDays,
    totalCompletedHires: metrics.totalCompleted
  };
};

export const calculateStageDurations = (activities) => {
  const appStages = {};
  
  activities.forEach(act => {
    if (!appStages[act.applicationId]) appStages[act.applicationId] = [];
    appStages[act.applicationId].push(act);
  });

  const stageDurations = {
    SCREENING: [],
    INTERVIEW: [],
    OFFERED: [],
    HIRED: []
  };

  Object.values(appStages).forEach(acts => {
    for (let i = 1; i < acts.length; i++) {
      const prev = acts[i - 1];
      const curr = acts[i];
      const days = getDiffInDays(new Date(prev.createdAt), new Date(curr.createdAt));
      
      if (stageDurations[curr.newStatus]) {
        stageDurations[curr.newStatus].push(days);
      }
    }
  });

  const getStats = (durations) => {
    const stats = calculateDurationMetrics(durations);
    return {
      averageDays: stats.averageDays,
      minimumDays: stats.fastestDays,
      maximumDays: stats.slowestDays
    };
  };

  return {
    screening: getStats(stageDurations.SCREENING),
    interview: getStats(stageDurations.INTERVIEW),
    offer: getStats(stageDurations.OFFERED),
    hire: getStats(stageDurations.HIRED)
  };
};

export const analyzeBottlenecks = (stageMetrics) => {
  let longestStage = "None";
  let averageDelay = 0;

  for (const [stage, stats] of Object.entries(stageMetrics)) {
    if (stats.averageDays > averageDelay) {
      averageDelay = stats.averageDays;
      longestStage = stage.charAt(0).toUpperCase() + stage.slice(1);
    }
  }

  return {
    longestStage,
    averageDelay,
    highestDropOffStage: "Interview" 
  };
};

export const calculateHiringTrends = (applications) => {
  const trends = { daily: {}, weekly: {}, monthly: {}, yearly: {} };

  applications.forEach(app => {
    let hireDate = app.updatedAt;
    if (app.offer?.acceptedAt) hireDate = app.offer.acceptedAt;
    else if (app.activities?.length > 0) hireDate = app.activities[0].createdAt;
    
    const d = new Date(hireDate);
    
    const dayKey = d.toISOString().split("T")[0];
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const weekKey = `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const yearKey = d.getFullYear().toString();

    trends.daily[dayKey] = (trends.daily[dayKey] || 0) + 1;
    trends.weekly[weekKey] = (trends.weekly[weekKey] || 0) + 1;
    trends.monthly[monthKey] = (trends.monthly[monthKey] || 0) + 1;
    trends.yearly[yearKey] = (trends.yearly[yearKey] || 0) + 1;
  });

  const formatTrend = (trendObj) => Object.keys(trendObj).sort().map(key => ({ period: key, hires: trendObj[key] }));

  return {
    daily: formatTrend(trends.daily),
    weekly: formatTrend(trends.weekly),
    monthly: formatTrend(trends.monthly),
    yearly: formatTrend(trends.yearly)
  };
};

// --- Source Analytics ---

export const bucketSourceData = (applications) => {
  const sources = {};
  const sourceKeys = ["CAREERS_PAGE", "COMPANY_WEBSITE", "LINKEDIN", "NAUKRI", "INDEED", "REFERRAL", "CONSULTANCY", "CAMPUS", "MANUAL", "OTHER"];
  
  sourceKeys.forEach(key => {
    sources[key] = {
      applications: [],
      counts: {
        totalApplications: 0, shortlistedApplications: 0, interviewScheduled: 0,
        interviewCompleted: 0, offersCreated: 0, offersSent: 0, offersAccepted: 0,
        hired: 0, rejected: 0
      }
    };
  });

  applications.forEach(app => {
    const src = app.source || "OTHER";
    if (!sources[src]) return;

    sources[src].applications.push(app);
    const counts = sources[src].counts;
    
    counts.totalApplications++;
    if (["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(app.status)) counts.shortlistedApplications++;
    if (app.status === "HIRED") counts.hired++;
    if (app.status === "REJECTED") counts.rejected++;
    
    if (app.interviews?.length > 0) {
      counts.interviewScheduled += app.interviews.length;
      counts.interviewCompleted += app.interviews.filter(i => i.status === "COMPLETED").length;
    }
    
    if (app.offer) {
      counts.offersCreated++;
      if (["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(app.offer.status)) counts.offersSent++;
      if (app.offer.status === "ACCEPTED") counts.offersAccepted++;
    }
  });

  return sources;
};

export const calculateSourceMetrics = (bucketedData) => {
  const result = {};
  
  for (const [source, data] of Object.entries(bucketedData)) {
    const funnelMetrics = calculateFunnelMetrics(data.counts);
    const hiredApps = data.applications.filter(app => app.status === "HIRED");
    const qualityMetrics = calculateTimeToHireMetrics(hiredApps);

    result[source] = {
      counts: funnelMetrics,
      conversion: {
        applicationConversionPercentage: funnelMetrics.applicationConversionRate,
        interviewConversionPercentage: funnelMetrics.interviewConversionRate,
        offerAcceptancePercentage: funnelMetrics.offerAcceptanceRate,
        hiringSuccessPercentage: funnelMetrics.hiringSuccessRate,
        overallFunnelConversionPercentage: funnelMetrics.overallFunnelConversionRate
      },
      quality: {
        averageTimeToHireDays: qualityMetrics.averageTimeToHire,
        averageInterviewScore: null,
        averageCandidateRating: null,
        averageOfferAcceptancePercentage: funnelMetrics.offerAcceptanceRate
      }
    };
  }
  return result;
};

export const generateSourceSummary = (sourceMetrics) => {
  let highestHires = -1, bestPerformingSource = "None", highestHiringSource = "None";
  let highestOfferAcceptance = -1, highestOfferAcceptanceSource = "None";
  let highestInterviewConversion = -1, highestInterviewConversionSource = "None";
  let lowestHires = Infinity, lowestPerformingSource = "None";

  for (const [source, data] of Object.entries(sourceMetrics)) {
    const hires = data.counts.hired;
    const offerAcc = data.conversion.offerAcceptancePercentage;
    const intConv = data.conversion.interviewConversionPercentage;

    if (hires > highestHires) { highestHires = hires; bestPerformingSource = source; highestHiringSource = source; }
    if (offerAcc > highestOfferAcceptance && data.counts.offersSent > 0) { highestOfferAcceptance = offerAcc; highestOfferAcceptanceSource = source; }
    if (intConv > highestInterviewConversion && data.counts.interviewCompleted > 0) { highestInterviewConversion = intConv; highestInterviewConversionSource = source; }
    if (hires < lowestHires && data.counts.totalApplications > 0) { lowestHires = hires; lowestPerformingSource = source; }
  }

  if (lowestHires === Infinity) lowestPerformingSource = "None";

  return { bestPerformingSource, highestHiringSource, highestOfferAcceptanceSource, highestInterviewConversionSource, lowestPerformingSource };
};

// --- Job Analytics ---

export const calculateJobMetrics = (job) => {
  const counts = {
    totalApplications: 0, shortlistedApplications: 0, interviewScheduled: 0,
    interviewCompleted: 0, offersCreated: 0, offersSent: 0, offersAccepted: 0, hired: 0, rejected: 0
  };

  const applications = job.applications || [];

  applications.forEach(app => {
    counts.totalApplications++;
    if (["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(app.status)) counts.shortlistedApplications++;
    if (app.status === "HIRED") counts.hired++;
    if (app.status === "REJECTED") counts.rejected++;
    
    if (app.interviews?.length > 0) {
      counts.interviewScheduled += app.interviews.length;
      counts.interviewCompleted += app.interviews.filter(i => i.status === "COMPLETED").length;
    }
    
    if (app.offer) {
      counts.offersCreated++;
      if (["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(app.offer.status)) counts.offersSent++;
      if (app.offer.status === "ACCEPTED") counts.offersAccepted++;
    }
  });

  const funnelMetrics = calculateFunnelMetrics(counts);
  const hiredApps = applications.filter(app => app.status === "HIRED");
  const timeToHireMetrics = calculateTimeToHireMetrics(hiredApps);

  const timeToFillDays = (job.publishedAt && job.closedAt) ? getDiffInDays(new Date(job.publishedAt), new Date(job.closedAt)) : null;

  return {
    jobDetails: { id: job.id, title: job.title, department: job.department, status: job.status, publishedAt: job.publishedAt, closedAt: job.closedAt },
    counts: funnelMetrics,
    conversion: {
      applicationConversionPercentage: funnelMetrics.applicationConversionRate,
      interviewConversionPercentage: funnelMetrics.interviewConversionRate,
      offerAcceptancePercentage: funnelMetrics.offerAcceptanceRate,
      hiringSuccessPercentage: funnelMetrics.hiringSuccessRate,
      overallJobConversionPercentage: funnelMetrics.overallFunnelConversionRate
    },
    performance: {
      averageTimeToHireDays: timeToHireMetrics.averageTimeToHire,
      timeToFillDays,
      averageCandidateRating: null,
      averageInterviewScore: null
    }
  };
};

export const generateJobRanking = (jobsAnalytics) => {
  return [...jobsAnalytics].sort((a, b) => {
    if (b.counts.hired !== a.counts.hired) return b.counts.hired - a.counts.hired;
    if (b.conversion.overallJobConversionPercentage !== a.conversion.overallJobConversionPercentage) {
      return b.conversion.overallJobConversionPercentage - a.conversion.overallJobConversionPercentage;
    }
    return b.counts.totalApplications - a.counts.totalApplications;
  });
};

export const generateJobsDashboardSummary = (jobsAnalytics) => {
  const totalJobs = jobsAnalytics.length;
  let activeJobs = 0, closedJobs = 0, totalApps = 0, totalHires = 0;

  jobsAnalytics.forEach(j => {
    if (j.jobDetails.status === "PUBLISHED") activeJobs++;
    if (j.jobDetails.status === "CLOSED") closedJobs++;
    totalApps += j.counts.totalApplications;
    totalHires += j.counts.hired;
  });

  const ranked = generateJobRanking(jobsAnalytics);
  let bestPerformingJob = "None", worstPerformingJob = "None";

  if (ranked.length > 0) {
    bestPerformingJob = ranked[0].jobDetails.title;
    const worst = [...ranked].reverse().find(j => j.counts.totalApplications > 0);
    if (worst) worstPerformingJob = worst.jobDetails.title;
  }

  return {
    totalJobs, activeJobs, closedJobs, bestPerformingJob, worstPerformingJob,
    averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApps / totalJobs) : 0,
    averageHiresPerJob: totalJobs > 0 ? Math.round(totalHires / totalJobs) : 0
  };
};

// --- Recruiter Analytics ---

export const bucketRecruiterData = (data) => {
  const { recruiters, jobs, activities, interviews, feedbacks, offers } = data;
  const bucket = {};

  recruiters.forEach(r => {
    bucket[r.id] = {
      recruiterDetails: { id: r.id, name: r.name, department: r.designation || "Recruiting" },
      counts: {
        jobsManaged: 0, applicationsReviewed: 0, applicationsShortlisted: 0,
        interviewsScheduled: 0, interviewsCompleted: 0, feedbackSubmitted: 0,
        offersCreated: 0, offersSent: 0, offersAccepted: 0, successfulHires: 0,
        rejectedCandidates: 0, totalOverallRating: 0
      }
    };
  });

  jobs.forEach(job => { if (bucket[job.createdBy]) bucket[job.createdBy].counts.jobsManaged++; });

  activities.forEach(act => {
    if (bucket[act.performedBy]) {
      const counts = bucket[act.performedBy].counts;
      counts.applicationsReviewed++;
      if (act.newStatus === "SHORTLISTED") counts.applicationsShortlisted++;
      if (act.newStatus === "HIRED") counts.successfulHires++;
      if (act.newStatus === "REJECTED") counts.rejectedCandidates++;
    }
  });

  interviews.forEach(int => {
    if (bucket[int.scheduledById]) {
      bucket[int.scheduledById].counts.interviewsScheduled++;
      if (int.status === "COMPLETED") bucket[int.scheduledById].counts.interviewsCompleted++;
    }
  });

  feedbacks.forEach(fb => {
    if (bucket[fb.interviewerId]) {
      bucket[fb.interviewerId].counts.feedbackSubmitted++;
      bucket[fb.interviewerId].counts.totalOverallRating += (fb.overallRating || 0);
    }
  });

  offers.forEach(offer => {
    if (bucket[offer.createdById]) {
      const counts = bucket[offer.createdById].counts;
      counts.offersCreated++;
      if (["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(offer.status)) counts.offersSent++;
      if (offer.status === "ACCEPTED") counts.offersAccepted++;
    }
  });

  return bucket;
};

export const calculateRecruiterMetrics = (bucketedData) => {
  return Object.values(bucketedData).map(recruiter => {
    const counts = recruiter.counts;

    const rates = {
      applicationReviewRate: calculatePercentage(counts.applicationsShortlisted + counts.rejectedCandidates + counts.successfulHires, counts.applicationsReviewed),
      interviewCompletionRate: calculatePercentage(counts.interviewsCompleted, counts.interviewsScheduled),
      offerAcceptanceRate: calculatePercentage(counts.offersAccepted, counts.offersSent),
      hiringSuccessRate: calculatePercentage(counts.successfulHires, counts.applicationsShortlisted),
      averageInterviewRating: counts.feedbackSubmitted > 0 ? parseFloat((counts.totalOverallRating / counts.feedbackSubmitted).toFixed(1)) : 0
    };

    const overallScore = calculateRecruiterScore(counts, rates);

    return {
      recruiterDetails: recruiter.recruiterDetails,
      counts: counts, // Retain raw counts
      performance: {
        applicationReviewRatePercentage: rates.applicationReviewRate,
        interviewCompletionRatePercentage: rates.interviewCompletionRate,
        offerAcceptanceRatePercentage: rates.offerAcceptanceRate,
        hiringSuccessRatePercentage: rates.hiringSuccessRate,
        averageTimeToHireDays: null,
        averageCandidateRating: null,
        averageInterviewRating: rates.averageInterviewRating,
        averageFeedbackRating: rates.averageInterviewRating,
        overallScore: parseFloat(overallScore.toFixed(2))
      }
    };
  });
};

export const generateRecruiterRanking = (recruitersAnalytics) => {
  return [...recruitersAnalytics].sort((a, b) => {
    if (b.counts.successfulHires !== a.counts.successfulHires) return b.counts.successfulHires - a.counts.successfulHires;
    return b.performance.overallScore - a.performance.overallScore;
  });
};

export const generateRecruiterDashboardSummary = (recruitersAnalytics) => {
  const ranked = generateRecruiterRanking(recruitersAnalytics);
  const totalRecruiters = recruitersAnalytics.length;
  
  let totalHires = 0, totalInterviews = 0, totalOffers = 0;

  recruitersAnalytics.forEach(r => {
    totalHires += r.counts.successfulHires;
    totalInterviews += r.counts.interviewsCompleted;
    totalOffers += r.counts.offersSent;
  });

  let topRecruiter = "None", lowestPerformingRecruiter = "None";

  if (ranked.length > 0) {
    if (ranked[0].counts.successfulHires > 0 || ranked[0].performance.overallScore > 0) topRecruiter = ranked[0].recruiterDetails.name;
    const worst = [...ranked].reverse().find(r => r.counts.jobsManaged > 0 || r.counts.applicationsReviewed > 0);
    if (worst) lowestPerformingRecruiter = worst.recruiterDetails.name;
  }

  return {
    topRecruiter, lowestPerformingRecruiter,
    averageHiresPerRecruiter: totalRecruiters > 0 ? Math.round(totalHires / totalRecruiters) : 0,
    averageInterviewsPerRecruiter: totalRecruiters > 0 ? Math.round(totalInterviews / totalRecruiters) : 0,
    averageOffersPerRecruiter: totalRecruiters > 0 ? Math.round(totalOffers / totalRecruiters) : 0
  };
};
