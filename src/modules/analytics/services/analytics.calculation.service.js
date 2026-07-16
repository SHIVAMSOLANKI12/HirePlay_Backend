/**
 * Analytics Calculation Service
 * Centralized calculation engine for all analytics math, percentages, durations, and scores.
 */

export const calculatePercentage = (numerator, denominator) => {
  if (!denominator || denominator === 0) return 0;
  return parseFloat(((numerator / denominator) * 100).toFixed(2));
};

export const getDiffInDays = (start, end) => {
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- Funnel & Conversion Rates ---

export const calculateFunnelRates = (counts) => {
  return {
    applicationConversionRate: calculatePercentage(counts.shortlistedApplications, counts.totalApplications),
    interviewConversionRate: calculatePercentage(counts.offersCreated, counts.interviewCompleted),
    offerAcceptanceRate: calculatePercentage(counts.offersAccepted, counts.offersSent),
    hiringSuccessRate: calculatePercentage(counts.hired, counts.offersAccepted),
    overallFunnelConversionRate: calculatePercentage(counts.hired, counts.totalApplications)
  };
};

// --- Duration & Time Metrics ---

export const calculateDurationMetrics = (durations) => {
  const totalCompleted = durations.length;
  if (totalCompleted === 0) {
    return {
      averageDays: 0,
      medianDays: 0,
      fastestDays: 0,
      slowestDays: 0,
      totalCompleted
    };
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const totalDays = sorted.reduce((acc, curr) => acc + curr, 0);
  const averageDays = Math.round(totalDays / totalCompleted);
  
  const mid = Math.floor(totalCompleted / 2);
  const medianDays = totalCompleted % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

  return {
    averageDays,
    medianDays,
    fastestDays: sorted[0],
    slowestDays: sorted[sorted.length - 1],
    totalCompleted
  };
};

// --- Recruiter Scoring ---

export const RECRUITER_SCORING_WEIGHTS = {
  SUCCESSFUL_HIRES: 0.40,
  OFFER_ACCEPTANCE_RATE: 0.20,
  INTERVIEW_COMPLETION: 0.15,
  AVERAGE_FEEDBACK_RATING: 0.15,
  HIRING_SPEED: 0.10,
  HIRE_MULTIPLIER: 10,
  SHORTLIST_MULTIPLIER: 2
};

export const calculateProductivityScore = (counts) => {
  return (counts.successfulHires * RECRUITER_SCORING_WEIGHTS.HIRE_MULTIPLIER) + 
         (counts.applicationsShortlisted * RECRUITER_SCORING_WEIGHTS.SHORTLIST_MULTIPLIER);
};

export const calculateHiringEfficiency = (rates) => {
  return (rates.offerAcceptanceRate * RECRUITER_SCORING_WEIGHTS.OFFER_ACCEPTANCE_RATE) + 
         (rates.interviewCompletionRate * RECRUITER_SCORING_WEIGHTS.INTERVIEW_COMPLETION);
};

export const calculateQualityScore = (averageRating) => {
  return (averageRating * 10) * RECRUITER_SCORING_WEIGHTS.AVERAGE_FEEDBACK_RATING; 
};

export const calculateRecruiterScore = (counts, rates) => {
  return calculateProductivityScore(counts) + calculateHiringEfficiency(rates) + calculateQualityScore(rates.averageInterviewRating);
};
