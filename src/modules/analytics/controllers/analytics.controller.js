import { successResponse } from "../../../utils/apiResponse.js";
import { getHiringFunnelWorkflow } from "../workflows/getHiringFunnel.workflow.js";
import { getDashboardSummaryWorkflow } from "../workflows/getDashboardSummary.workflow.js";
import { getTimeToHireWorkflow } from "../workflows/getTimeToHire.workflow.js";
import { getHiringTrendsWorkflow } from "../workflows/getHiringTrends.workflow.js";
import { getSourceAnalyticsWorkflow } from "../workflows/getSourceAnalytics.workflow.js";
import { getSourceSummaryWorkflow } from "../workflows/getSourceSummary.workflow.js";
import { getJobsAnalyticsWorkflow } from "../workflows/getJobsAnalytics.workflow.js";
import { getJobAnalyticsByIdWorkflow } from "../workflows/getJobAnalyticsById.workflow.js";
import { getJobsRankingWorkflow } from "../workflows/getJobsRanking.workflow.js";
import { getRecruitersAnalyticsWorkflow } from "../workflows/getRecruitersAnalytics.workflow.js";
import { getRecruiterAnalyticsByIdWorkflow } from "../workflows/getRecruiterAnalyticsById.workflow.js";
import { getRecruitersRankingWorkflow } from "../workflows/getRecruitersRanking.workflow.js";

export const getHiringFunnel = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      jobId: req.query.jobId,
      department: req.query.department
    };
    
    const funnel = await getHiringFunnelWorkflow(req.user, filters);
    return successResponse(res, funnel, "Hiring funnel analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      jobId: req.query.jobId,
      department: req.query.department
    };
    
    const summary = await getDashboardSummaryWorkflow(req.user, filters);
    return successResponse(res, summary, "Dashboard summary retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getTimeToHire = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      jobId: req.query.jobId,
      department: req.query.department
    };
    
    const timeToHire = await getTimeToHireWorkflow(req.user, filters);
    return successResponse(res, timeToHire, "Time to hire analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getHiringTrends = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      jobId: req.query.jobId,
      department: req.query.department
    };
    
    const trends = await getHiringTrendsWorkflow(req.user, filters);
    return successResponse(res, trends, "Hiring trends retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getSourceAnalytics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      jobId: req.query.jobId,
      department: req.query.department,
      source: req.query.source
    };
    
    const sourceAnalytics = await getSourceAnalyticsWorkflow(req.user, filters);
    return successResponse(res, sourceAnalytics, "Source analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getSourceSummary = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      jobId: req.query.jobId,
      department: req.query.department,
      source: req.query.source
    };
    
    const summary = await getSourceSummaryWorkflow(req.user, filters);
    return successResponse(res, summary, "Source summary retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getJobsAnalytics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      department: req.query.department,
      employmentType: req.query.employmentType,
      status: req.query.status
    };
    
    const jobAnalytics = await getJobsAnalyticsWorkflow(req.user, filters);
    return successResponse(res, jobAnalytics, "Jobs analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getJobAnalyticsById = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const jobAnalytics = await getJobAnalyticsByIdWorkflow(req.user, filters, jobId);
    return successResponse(res, jobAnalytics, "Job analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getJobsRanking = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      department: req.query.department,
      employmentType: req.query.employmentType,
      status: req.query.status
    };
    
    const ranking = await getJobsRankingWorkflow(req.user, filters);
    return successResponse(res, ranking, "Jobs ranking retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getRecruitersAnalytics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      department: req.query.department,
      jobId: req.query.jobId,
      status: req.query.status
    };
    
    const recruiterAnalytics = await getRecruitersAnalyticsWorkflow(req.user, filters);
    return successResponse(res, recruiterAnalytics, "Recruiters analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getRecruiterAnalyticsById = async (req, res, next) => {
  try {
    const { recruiterId } = req.params;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      department: req.query.department,
      jobId: req.query.jobId,
      status: req.query.status
    };
    
    const recruiterAnalytics = await getRecruiterAnalyticsByIdWorkflow(req.user, filters, recruiterId);
    return successResponse(res, recruiterAnalytics, "Recruiter analytics retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getRecruitersRanking = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      department: req.query.department,
      jobId: req.query.jobId,
      status: req.query.status
    };
    
    const ranking = await getRecruitersRankingWorkflow(req.user, filters);
    return successResponse(res, ranking, "Recruiters ranking retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};
