import { eventEngine } from "../../notification/events/event.engine.js";
import { logActivity } from "./activityLog.service.js";
import { ACTIVITY_EVENTS } from "../constants/activity.events.js";

/**
 * ActivityLoggerService
 * Automatically listens to domain events and translates them into Activity Logs.
 * 
 * Payload structure expected for events:
 * {
 *   companyId,
 *   userId,
 *   entityId,
 *   oldValue, // optional
 *   newValue, // optional
 *   metadata, // optional
 *   ipAddress, // optional
 *   userAgent, // optional
 *   performedByRole // optional
 * }
 */

const EVENT_MAPPINGS = {
  // Authentication
  [ACTIVITY_EVENTS.AUTH_LOGIN]: { entityType: "AUTH", action: "LOGIN" },
  [ACTIVITY_EVENTS.AUTH_LOGOUT]: { entityType: "AUTH", action: "LOGOUT" },
  [ACTIVITY_EVENTS.AUTH_PASSWORD_RESET]: { entityType: "AUTH", action: "PASSWORD_RESET" },

  // HR
  [ACTIVITY_EVENTS.HR_CREATED]: { entityType: "HR", action: "CREATE" },
  [ACTIVITY_EVENTS.HR_UPDATED]: { entityType: "HR", action: "UPDATE" },
  [ACTIVITY_EVENTS.HR_DELETED]: { entityType: "HR", action: "DELETE" },

  // Jobs
  [ACTIVITY_EVENTS.JOB_CREATED]: { entityType: "JOB", action: "CREATE" },
  [ACTIVITY_EVENTS.JOB_UPDATED]: { entityType: "JOB", action: "UPDATE" },
  [ACTIVITY_EVENTS.JOB_PUBLISHED]: { entityType: "JOB", action: "PUBLISH" },
  [ACTIVITY_EVENTS.JOB_CLOSED]: { entityType: "JOB", action: "CLOSE" },
  [ACTIVITY_EVENTS.JOB_DELETED]: { entityType: "JOB", action: "DELETE" },

  // Applications
  [ACTIVITY_EVENTS.APPLICATION_APPLIED]: { entityType: "APPLICATION", action: "APPLY" },
  [ACTIVITY_EVENTS.APPLICATION_WITHDRAWN]: { entityType: "APPLICATION", action: "WITHDRAW" },
  [ACTIVITY_EVENTS.APPLICATION_STATUS_CHANGED]: { entityType: "APPLICATION", action: "STATUS_CHANGE" },

  // Interviews
  [ACTIVITY_EVENTS.INTERVIEW_SCHEDULED]: { entityType: "INTERVIEW", action: "SCHEDULE" },
  [ACTIVITY_EVENTS.INTERVIEW_RESCHEDULED]: { entityType: "INTERVIEW", action: "RESCHEDULE" },
  [ACTIVITY_EVENTS.INTERVIEW_CANCELLED]: { entityType: "INTERVIEW", action: "CANCEL" },
  [ACTIVITY_EVENTS.INTERVIEW_FEEDBACK_SUBMITTED]: { entityType: "INTERVIEW", action: "FEEDBACK" },

  // Offers
  [ACTIVITY_EVENTS.OFFER_CREATED]: { entityType: "OFFER", action: "CREATE" },
  [ACTIVITY_EVENTS.OFFER_APPROVED]: { entityType: "OFFER", action: "APPROVE" },
  [ACTIVITY_EVENTS.OFFER_SENT]: { entityType: "OFFER", action: "SEND" },
  [ACTIVITY_EVENTS.OFFER_ACCEPTED]: { entityType: "OFFER", action: "ACCEPT" },
  [ACTIVITY_EVENTS.OFFER_REJECTED]: { entityType: "OFFER", action: "REJECT" },

  // Notifications
  [ACTIVITY_EVENTS.NOTIFICATION_EMAIL_SENT]: { entityType: "NOTIFICATION", action: "SEND" },
  [ACTIVITY_EVENTS.NOTIFICATION_EMAIL_FAILED]: { entityType: "NOTIFICATION", action: "UPDATE" } // Since there's no "FAILED" action, we use "UPDATE" with metadata
};

export const initializeActivityLogger = () => {
  // Subscribe to all mapped events
  Object.keys(EVENT_MAPPINGS).forEach((eventName) => {
    eventEngine.on(eventName, async (payload) => {
      try {
        const mapping = EVENT_MAPPINGS[eventName];
        
        await logActivity({
          companyId: payload.companyId,
          userId: payload.userId,
          entityType: mapping.entityType,
          entityId: payload.entityId,
          action: mapping.action,
          oldValue: payload.oldValue || null,
          newValue: payload.newValue || null,
          metadata: payload.metadata || null,
          ipAddress: payload.ipAddress || null,
          userAgent: payload.userAgent || null,
          performedByRole: payload.performedByRole || null
        });
      } catch (error) {
        console.error(`[ActivityLogger] Failed to log activity for event ${eventName}:`, error);
        // Failures here are silent and don't break the application logic
      }
    });
  });
};
