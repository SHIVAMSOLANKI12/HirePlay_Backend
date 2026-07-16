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
