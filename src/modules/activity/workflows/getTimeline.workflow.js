import AppError from "../../../utils/AppError.js";
import { getActivityLogs } from "../repositories/activityLog.repository.js";
import { ACTIVITY_ENTITIES } from "../constants/activity.constants.js";

/**
 * Execute the fetch timeline workflow.
 * 
 * @param {Object} user - The authenticated user (HR or Company Admin)
 * @param {string} entityType - The type of entity (e.g. application, job, interview)
 * @param {string} entityId - The specific entity ID
 * @param {Object} filters - Query filters (page, limit, etc)
 * @returns {Promise<Object>} Paginated activity logs
 */
export const getTimelineWorkflow = async (user, entityType, entityId, filters) => {
  if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "HR")) {
    throw new AppError("Access denied", 403);
  }

  const companyId = user.companyId || user.id; // Support both HR (companyId) and Company Admin (id)

  // Map route entity type to database entity type (ACTIVITY_ENTITIES)
  const typeMap = {
    "application": ACTIVITY_ENTITIES.APPLICATION,
    "job": ACTIVITY_ENTITIES.JOB,
    "interview": ACTIVITY_ENTITIES.INTERVIEW,
    "offer": ACTIVITY_ENTITIES.OFFER,
    "hr": ACTIVITY_ENTITIES.HR,
    "company": ACTIVITY_ENTITIES.COMPANY
  };

  const isCandidate = entityType.toLowerCase() === "candidate";
  const mappedEntityType = typeMap[entityType.toLowerCase()];

  if (!isCandidate && !mappedEntityType) {
    throw new AppError(`Invalid entity type for timeline: ${entityType}`, 400);
  }

  // Inject entity parameters into filters for repository
  const queryFilters = {
    ...filters
  };

  if (isCandidate) {
    // For candidate timeline, filter by userId
    queryFilters.userId = entityId;
  } else {
    // For other entities, filter by entityType and entityId
    queryFilters.entityType = mappedEntityType;
    queryFilters.entityId = entityId;
  }

  const activities = await getActivityLogs(companyId, queryFilters);

  return activities;
};
