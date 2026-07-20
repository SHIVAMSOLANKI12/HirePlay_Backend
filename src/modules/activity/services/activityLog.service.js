import { createActivityLog as _createActivityLog, getActivityLogById, getActivityLogs } from "../repositories/activityLog.repository.js";
import AppError from "../../../utils/AppError.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../constants/activity.constants.js";

export const logActivity = async (payload) => {
  const { companyId, userId, entityType, entityId, action, oldValue, newValue, metadata, ipAddress, userAgent, performedByRole } = payload;
  
  if (!entityType || !ACTIVITY_ENTITIES[entityType]) {
    throw new AppError("Invalid Activity Entity Type", 400);
  }
  
  if (!action || !ACTIVITY_ACTIONS[action]) {
    throw new AppError("Invalid Activity Action", 400);
  }

  // This function might be called in the background without waiting,
  // so we catch and log errors to prevent crashing the main thread.
  try {
    return await _createActivityLog({
      companyId,
      userId,
      entityType,
      entityId,
      action,
      oldValue: oldValue || null,
      newValue: newValue || null,
      metadata: metadata || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      performedByRole: performedByRole || null
    });
  } catch (error) {
    console.error("[ActivityLog] Failed to log activity:", error);
    // Suppress error so it doesn't break business operations
    return null;
  }
};

// Adapter for legacy `createActivityLog` calls from business modules
export const createActivityLog = async (data, tx) => {
  const type = data.type || '';
  
  const entityType = type.includes('JOB') ? 'JOB' : 
                     type.includes('INTERVIEW') ? 'INTERVIEW' :
                     type.includes('OFFER') ? 'OFFER' :
                     type.includes('APPLICATION') ? 'APPLICATION' : 'SYSTEM';

  const action = (type.includes('CREATED') || type.includes('SUBMITTED')) ? 'CREATE' :
                 type.includes('UPDATED') ? 'UPDATE' :
                 type.includes('CLOSED') ? 'CLOSE' :
                 type.includes('SCHEDULED') ? 'SCHEDULE' :
                 type.includes('RESCHEDULED') ? 'RESCHEDULE' :
                 type.includes('CANCELLED') ? 'CANCEL' :
                 type.includes('WITHDRAWN') ? 'WITHDRAW' :
                 type.includes('REJECTED') ? 'REJECT' :
                 type.includes('ACCEPTED') ? 'ACCEPT' :
                 type.includes('SENT') ? 'SEND' :
                 type.includes('REVIEWED') ? 'STATUS_CHANGE' : 'UPDATE';

  const entityId = data.applicationId || data.jobId || data.offerId || data.interviewId || null;

  return await logActivity({
    companyId: data.companyId,
    userId: data.userId,
    entityType,
    entityId,
    action,
    oldValue: null,
    newValue: { title: data.title, description: data.description },
    metadata: data.metadata,
  });
};

export const fetchActivityById = async (companyId, activityId) => {
  const activity = await getActivityLogById(companyId, activityId);
  if (!activity) {
    throw new AppError("Activity Log not found", 404);
  }
  return activity;
};

export const fetchActivities = async (companyId, filters) => {
  return await getActivityLogs(companyId, filters);
};
