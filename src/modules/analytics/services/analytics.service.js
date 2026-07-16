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
