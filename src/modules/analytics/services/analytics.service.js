import prisma from "../../../config/prisma.js";

/**
 * Safely calculates a percentage. Returns 0 if denominator is 0.
 */
const calculatePercentage = (numerator, denominator) => {
  if (!denominator || denominator === 0) return 0;
  return parseFloat(((numerator / denominator) * 100).toFixed(2));
};

export const calculateFunnelMetrics = (counts) => {
  const {
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
  } = counts;

  // Calculation Logic approved in Phase 6 Sprint 1
  const applicationConversionRate = calculatePercentage(shortlistedApplications, totalApplications);
  const interviewConversionRate = calculatePercentage(offersCreated, interviewCompleted);
  const offerAcceptanceRate = calculatePercentage(offersAccepted, offersSent);
  const hiringSuccessRate = calculatePercentage(hired, offersAccepted);
  const overallFunnelConversionRate = calculatePercentage(hired, totalApplications);

  return {
    ...counts,
    applicationConversionRate,
    interviewConversionRate,
    offerAcceptanceRate,
    hiringSuccessRate,
    overallFunnelConversionRate
  };
};

export const calculateDashboardMetrics = (counts) => {
  return {
    ...counts,
    averageTimeToHire: 0 // Placeholder for future implementation
  };
};

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

const getDiffInDays = (start, end) => {
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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
    // Determine hire date
    let hireDate = app.updatedAt;
    if (app.offer?.acceptedAt) {
      hireDate = app.offer.acceptedAt;
    } else if (app.activities && app.activities.length > 0) {
      hireDate = app.activities[0].createdAt;
    }
    
    return getDiffInDays(new Date(app.appliedAt), new Date(hireDate));
  }).sort((a, b) => a - b);

  const totalCompletedHires = durations.length;
  const totalDays = durations.reduce((acc, curr) => acc + curr, 0);
  const averageTimeToHire = totalCompletedHires > 0 ? Math.round(totalDays / totalCompletedHires) : 0;
  
  const mid = Math.floor(totalCompletedHires / 2);
  const medianTimeToHire = totalCompletedHires % 2 !== 0 ? durations[mid] : Math.round((durations[mid - 1] + durations[mid]) / 2);

  return {
    averageTimeToHire,
    medianTimeToHire,
    fastestHire: durations[0] || 0,
    slowestHire: durations[durations.length - 1] || 0,
    totalCompletedHires
  };
};

export const calculateStageDurations = (activities) => {
  // Group activities by application ID to calculate sequential stages
  const appStages = {};
  
  activities.forEach(act => {
    if (!appStages[act.applicationId]) {
      appStages[act.applicationId] = [];
    }
    appStages[act.applicationId].push(act);
  });

  const stageDurations = {
    SCREENING: [],
    INTERVIEW: [],
    OFFERED: [],
    HIRED: []
  };

  // Compute durations between sequential steps per application
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

  const calculateStageStats = (durations) => {
    if (durations.length === 0) return { averageDays: 0, minimumDays: 0, maximumDays: 0 };
    durations.sort((a, b) => a - b);
    const sum = durations.reduce((acc, val) => acc + val, 0);
    return {
      averageDays: Math.round(sum / durations.length),
      minimumDays: durations[0],
      maximumDays: durations[durations.length - 1]
    };
  };

  return {
    screening: calculateStageStats(stageDurations.SCREENING),
    interview: calculateStageStats(stageDurations.INTERVIEW),
    offer: calculateStageStats(stageDurations.OFFERED),
    hire: calculateStageStats(stageDurations.HIRED)
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

  // Without funnel counts, drop-off is hard to compute precisely per application in this metric, 
  // so we return placeholders that front-end can calculate by combining funnel API
  return {
    longestStage,
    averageDelay,
    highestDropOffStage: "Interview" // Fallback placeholder since drop-off requires funnel counts
  };
};

export const calculateHiringTrends = (applications) => {
  const trends = {
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {}
  };

  applications.forEach(app => {
    let hireDate = app.updatedAt;
    if (app.offer?.acceptedAt) hireDate = app.offer.acceptedAt;
    else if (app.activities?.length > 0) hireDate = app.activities[0].createdAt;
    
    const d = new Date(hireDate);
    
    const dayKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    
    // ISO week number approximation
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

  const formatTrend = (trendObj) => {
    return Object.keys(trendObj).sort().map(key => ({
      period: key,
      hires: trendObj[key]
    }));
  };

  return {
    daily: formatTrend(trends.daily),
    weekly: formatTrend(trends.weekly),
    monthly: formatTrend(trends.monthly),
    yearly: formatTrend(trends.yearly)
  };
};

export const bucketSourceData = (applications) => {
  const sources = {};
  
  // Initialize default structure
  const sourceKeys = ["CAREERS_PAGE", "COMPANY_WEBSITE", "LINKEDIN", "NAUKRI", "INDEED", "REFERRAL", "CONSULTANCY", "CAMPUS", "MANUAL", "OTHER"];
  sourceKeys.forEach(key => {
    sources[key] = {
      applications: [],
      counts: {
        totalApplications: 0,
        shortlistedApplications: 0,
        interviewScheduled: 0,
        interviewCompleted: 0,
        offersCreated: 0,
        offersSent: 0,
        offersAccepted: 0,
        hired: 0,
        rejected: 0
      }
    };
  });

  applications.forEach(app => {
    const src = app.source || "OTHER";
    if (!sources[src]) return;

    sources[src].applications.push(app);
    const counts = sources[src].counts;
    
    counts.totalApplications++;
    
    if (["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(app.status)) {
      counts.shortlistedApplications++;
    }
    
    if (app.status === "HIRED") counts.hired++;
    if (app.status === "REJECTED") counts.rejected++;
    
    if (app.interviews && app.interviews.length > 0) {
      counts.interviewScheduled += app.interviews.length;
      counts.interviewCompleted += app.interviews.filter(i => i.status === "COMPLETED").length;
    }
    
    if (app.offer) {
      counts.offersCreated++;
      if (["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(app.offer.status)) {
        counts.offersSent++;
      }
      if (app.offer.status === "ACCEPTED") {
        counts.offersAccepted++;
      }
    }
  });

  return sources;
};

export const calculateSourceMetrics = (bucketedData) => {
  const result = {};
  
  for (const [source, data] of Object.entries(bucketedData)) {
    const funnelMetrics = calculateFunnelMetrics(data.counts);
    
    // We only pass hired apps to calculate time to hire
    const hiredApps = data.applications.filter(app => app.status === "HIRED");
    const qualityMetrics = calculateTimeToHireMetrics(hiredApps);

    result[source] = {
      counts: funnelMetrics, // Funnel counts
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
  let highestHires = -1;
  let bestPerformingSource = "None";
  let highestHiringSource = "None";
  
  let highestOfferAcceptance = -1;
  let highestOfferAcceptanceSource = "None";
  
  let highestInterviewConversion = -1;
  let highestInterviewConversionSource = "None";
  
  let lowestHires = Infinity;
  let lowestPerformingSource = "None";

  for (const [source, data] of Object.entries(sourceMetrics)) {
    const hires = data.counts.hired;
    const offerAcc = data.conversion.offerAcceptancePercentage;
    const intConv = data.conversion.interviewConversionPercentage;

    if (hires > highestHires) {
      highestHires = hires;
      bestPerformingSource = source;
      highestHiringSource = source;
    }

    if (offerAcc > highestOfferAcceptance && data.counts.offersSent > 0) {
      highestOfferAcceptance = offerAcc;
      highestOfferAcceptanceSource = source;
    }

    if (intConv > highestInterviewConversion && data.counts.interviewCompleted > 0) {
      highestInterviewConversion = intConv;
      highestInterviewConversionSource = source;
    }

    if (hires < lowestHires && data.counts.totalApplications > 0) {
      lowestHires = hires;
      lowestPerformingSource = source;
    }
  }

  if (lowestHires === Infinity) lowestPerformingSource = "None";

  return {
    bestPerformingSource,
    highestHiringSource,
    highestOfferAcceptanceSource,
    highestInterviewConversionSource,
    lowestPerformingSource
  };
};

export const calculateJobMetrics = (job) => {
  const counts = {
    totalApplications: 0,
    shortlistedApplications: 0,
    interviewScheduled: 0,
    interviewCompleted: 0,
    offersCreated: 0,
    offersSent: 0,
    offersAccepted: 0,
    hired: 0,
    rejected: 0
  };

  const applications = job.applications || [];

  applications.forEach(app => {
    counts.totalApplications++;
    
    if (["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(app.status)) {
      counts.shortlistedApplications++;
    }
    
    if (app.status === "HIRED") counts.hired++;
    if (app.status === "REJECTED") counts.rejected++;
    
    if (app.interviews && app.interviews.length > 0) {
      counts.interviewScheduled += app.interviews.length;
      counts.interviewCompleted += app.interviews.filter(i => i.status === "COMPLETED").length;
    }
    
    if (app.offer) {
      counts.offersCreated++;
      if (["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(app.offer.status)) {
        counts.offersSent++;
      }
      if (app.offer.status === "ACCEPTED") {
        counts.offersAccepted++;
      }
    }
  });

  const funnelMetrics = calculateFunnelMetrics(counts);
  const hiredApps = applications.filter(app => app.status === "HIRED");
  const timeMetrics = calculateTimeToHireMetrics(hiredApps);
  
  // Calculate Time to Fill
  const timeToFillDays = calculateTimeToFill(job, hiredApps);

  return {
    jobDetails: {
      id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      publishedAt: job.publishedAt,
      closedAt: job.closedAt
    },
    counts: funnelMetrics,
    conversion: {
      applicationConversionPercentage: funnelMetrics.applicationConversionRate,
      interviewConversionPercentage: funnelMetrics.interviewConversionRate,
      offerAcceptancePercentage: funnelMetrics.offerAcceptanceRate,
      hiringSuccessPercentage: funnelMetrics.hiringSuccessRate,
      overallJobConversionPercentage: funnelMetrics.overallFunnelConversionRate
    },
    timeMetrics: {
      averageTimeToFillDays: timeToFillDays,
      averageTimeToHireDays: timeMetrics.averageTimeToHire,
      fastestHireDays: timeMetrics.fastestHire,
      slowestHireDays: timeMetrics.slowestHire,
      averageInterviewDuration: null, // Would require calculating interview.scheduledAt -> completedAt
      averageOfferAcceptanceTime: null // Would require calculating offer.sentAt -> acceptedAt
    }
  };
};

export const calculateTimeToFill = (job, hiredApps) => {
  if (!job.publishedAt) return null; // Can't calculate if never published
  
  let end = job.closedAt;
  
  // If not closed, find the latest hire date
  if (!end && hiredApps && hiredApps.length > 0) {
    let latestHireDate = null;
    hiredApps.forEach(app => {
      let hireDate = app.updatedAt;
      if (app.offer?.acceptedAt) hireDate = app.offer.acceptedAt;
      else if (app.activities?.length > 0) hireDate = app.activities[0].createdAt;
      
      if (!latestHireDate || new Date(hireDate) > new Date(latestHireDate)) {
        latestHireDate = hireDate;
      }
    });
    end = latestHireDate;
  }
  
  if (!end) return null; // Still open and no hires
  
  return getDiffInDays(new Date(job.publishedAt), new Date(end));
};

export const generateJobRanking = (jobsAnalytics) => {
  // Sort by Hires, then by Conversion Rate
  const ranked = [...jobsAnalytics].sort((a, b) => {
    if (b.counts.hired !== a.counts.hired) {
      return b.counts.hired - a.counts.hired;
    }
    return b.conversion.overallJobConversionPercentage - a.conversion.overallJobConversionPercentage;
  });

  return ranked;
};

export const generateJobsDashboardSummary = (jobsAnalytics) => {
  let totalJobs = jobsAnalytics.length;
  let activeJobs = 0;
  let closedJobs = 0;
  let totalApps = 0;
  let totalHires = 0;

  jobsAnalytics.forEach(j => {
    if (j.jobDetails.status === "PUBLISHED") activeJobs++;
    if (j.jobDetails.status === "CLOSED") closedJobs++;
    totalApps += j.counts.totalApplications;
    totalHires += j.counts.hired;
  });

  const ranked = generateJobRanking(jobsAnalytics);
  
  let bestPerformingJob = null;
  let worstPerformingJob = null;

  if (ranked.length > 0) {
    // Best is the top of the ranked list (if it has hires)
    if (ranked[0].counts.hired > 0) {
      bestPerformingJob = ranked[0].jobDetails.title;
    }
    
    // Worst is the bottom of the ranked list (if it has applications but low/no hires)
    const reversed = [...ranked].reverse();
    const worst = reversed.find(j => j.counts.totalApplications > 0);
    if (worst) {
      worstPerformingJob = worst.jobDetails.title;
    }
  }

  return {
    totalJobs,
    activeJobs,
    closedJobs,
    bestPerformingJob: bestPerformingJob || "None",
    worstPerformingJob: worstPerformingJob || "None",
    averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApps / totalJobs) : 0,
    averageHiresPerJob: totalJobs > 0 ? Math.round(totalHires / totalJobs) : 0
  };
};

export const bucketRecruiterData = (data) => {
  const { recruiters, jobs, activities, interviews, feedbacks, offers } = data;
  const bucket = {};

  // Initialize
  recruiters.forEach(r => {
    bucket[r.id] = {
      recruiterDetails: {
        id: r.id,
        name: r.name,
        department: r.designation || "Recruiting"
      },
      counts: {
        jobsManaged: 0,
        applicationsReviewed: 0,
        applicationsShortlisted: 0,
        interviewsScheduled: 0,
        interviewsCompleted: 0,
        feedbackSubmitted: 0,
        offersCreated: 0,
        offersSent: 0,
        offersAccepted: 0,
        successfulHires: 0,
        rejectedCandidates: 0,
        totalOverallRating: 0 // for average interview rating
      }
    };
  });

  // Aggregate Jobs
  jobs.forEach(job => {
    if (bucket[job.createdBy]) {
      bucket[job.createdBy].counts.jobsManaged++;
    }
  });

  // Aggregate Activities
  activities.forEach(act => {
    if (bucket[act.performedBy]) {
      const counts = bucket[act.performedBy].counts;
      // All activities count as reviewed basically, but let's be specific
      counts.applicationsReviewed++;

      if (act.newStatus === "SHORTLISTED") counts.applicationsShortlisted++;
      if (act.newStatus === "HIRED") counts.successfulHires++;
      if (act.newStatus === "REJECTED") counts.rejectedCandidates++;
    }
  });

  // Aggregate Interviews
  interviews.forEach(int => {
    if (bucket[int.scheduledById]) {
      bucket[int.scheduledById].counts.interviewsScheduled++;
      if (int.status === "COMPLETED") {
        bucket[int.scheduledById].counts.interviewsCompleted++;
      }
    }
  });

  // Aggregate Feedbacks
  feedbacks.forEach(fb => {
    if (bucket[fb.interviewerId]) {
      bucket[fb.interviewerId].counts.feedbackSubmitted++;
      bucket[fb.interviewerId].counts.totalOverallRating += (fb.overallRating || 0);
    }
  });

  // Aggregate Offers
  offers.forEach(offer => {
    if (bucket[offer.createdById]) {
      const counts = bucket[offer.createdById].counts;
      counts.offersCreated++;
      if (["SENT", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(offer.status)) {
        counts.offersSent++;
      }
      if (offer.status === "ACCEPTED") {
        counts.offersAccepted++;
      }
    }
  });

  return bucket;
};

export const calculateRecruiterMetrics = (bucketedData) => {
  return Object.values(bucketedData).map(recruiter => {
    const counts = recruiter.counts;

    // Rates
    const applicationReviewRate = calculatePercentage(
      counts.applicationsShortlisted + counts.rejectedCandidates + counts.successfulHires,
      counts.applicationsReviewed
    );
    
    const interviewCompletionRate = calculatePercentage(
      counts.interviewsCompleted,
      counts.interviewsScheduled
    );

    const offerAcceptanceRate = calculatePercentage(
      counts.offersAccepted,
      counts.offersSent
    );

    const hiringSuccessRate = calculatePercentage(
      counts.successfulHires,
      counts.applicationsShortlisted
    );

    const averageInterviewRating = counts.feedbackSubmitted > 0 
      ? parseFloat((counts.totalOverallRating / counts.feedbackSubmitted).toFixed(1)) 
      : 0;

    // Overall Score (Simple arbitrary weighting for ranking purposes)
    // Score = Hires*10 + Shortlists*2 + Offer Acceptance%*0.5 + Interview Completion%*0.2
    const overallScore = 
      (counts.successfulHires * 10) + 
      (counts.applicationsShortlisted * 2) + 
      (offerAcceptanceRate * 0.5) + 
      (interviewCompletionRate * 0.2);

    return {
      recruiterDetails: recruiter.recruiterDetails,
      counts: {
        jobsManaged: counts.jobsManaged,
        applicationsReviewed: counts.applicationsReviewed,
        applicationsShortlisted: counts.applicationsShortlisted,
        interviewsScheduled: counts.interviewsScheduled,
        interviewsCompleted: counts.interviewsCompleted,
        feedbackSubmitted: counts.feedbackSubmitted,
        offersCreated: counts.offersCreated,
        offersSent: counts.offersSent,
        offersAccepted: counts.offersAccepted,
        successfulHires: counts.successfulHires,
        rejectedCandidates: counts.rejectedCandidates
      },
      performance: {
        applicationReviewRatePercentage: applicationReviewRate,
        interviewCompletionRatePercentage: interviewCompletionRate,
        offerAcceptanceRatePercentage: offerAcceptanceRate,
        hiringSuccessRatePercentage: hiringSuccessRate,
        averageTimeToHireDays: null, // Requires tracking specific candidates to hire timeline
        averageCandidateRating: null, // Not in schema
        averageInterviewRating: averageInterviewRating,
        averageFeedbackRating: averageInterviewRating,
        overallScore: parseFloat(overallScore.toFixed(2))
      }
    };
  });
};

export const generateRecruiterRanking = (recruitersAnalytics) => {
  // Sort by Successful Hires, then by Overall Score
  return [...recruitersAnalytics].sort((a, b) => {
    if (b.counts.successfulHires !== a.counts.successfulHires) {
      return b.counts.successfulHires - a.counts.successfulHires;
    }
    return b.performance.overallScore - a.performance.overallScore;
  });
};

export const generateRecruiterDashboardSummary = (recruitersAnalytics) => {
  const ranked = generateRecruiterRanking(recruitersAnalytics);
  const totalRecruiters = recruitersAnalytics.length;
  
  let totalHires = 0;
  let totalInterviews = 0;
  let totalOffers = 0;

  recruitersAnalytics.forEach(r => {
    totalHires += r.counts.successfulHires;
    totalInterviews += r.counts.interviewsCompleted;
    totalOffers += r.counts.offersSent;
  });

  let topRecruiter = "None";
  let lowestPerformingRecruiter = "None";

  if (ranked.length > 0) {
    if (ranked[0].counts.successfulHires > 0 || ranked[0].performance.overallScore > 0) {
      topRecruiter = ranked[0].recruiterDetails.name;
    }
    
    // Bottom performer who has actually reviewed applications or managed jobs
    const reversed = [...ranked].reverse();
    const worst = reversed.find(r => r.counts.jobsManaged > 0 || r.counts.applicationsReviewed > 0);
    if (worst) {
      lowestPerformingRecruiter = worst.recruiterDetails.name;
    }
  }

  return {
    topRecruiter,
    lowestPerformingRecruiter,
    averageHiresPerRecruiter: totalRecruiters > 0 ? Math.round(totalHires / totalRecruiters) : 0,
    averageInterviewsPerRecruiter: totalRecruiters > 0 ? Math.round(totalInterviews / totalRecruiters) : 0,
    averageOffersPerRecruiter: totalRecruiters > 0 ? Math.round(totalOffers / totalRecruiters) : 0
  };
};
