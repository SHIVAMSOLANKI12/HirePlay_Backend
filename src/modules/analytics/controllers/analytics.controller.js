import { successResponse } from "../../../utils/apiResponse.js";
import { getHiringFunnelWorkflow } from "../workflows/getHiringFunnel.workflow.js";
import { getDashboardSummaryWorkflow } from "../workflows/getDashboardSummary.workflow.js";
import { getTimeToHireWorkflow } from "../workflows/getTimeToHire.workflow.js";
import { getHiringTrendsWorkflow } from "../workflows/getHiringTrends.workflow.js";

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
