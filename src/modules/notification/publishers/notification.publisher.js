import { eventEngine } from "../events/event.engine.js";

/**
 * Reusable Event Publisher
 * Modules should call this to dispatch notifications instead of directly creating them in DB.
 * 
 * @param {string} eventName - Use NOTIFICATION_EVENTS
 * @param {Object} payload - { companyId, userId, title, message, type, channel, metadata }
 */
export const publishNotificationEvent = (eventName, payload) => {
  eventEngine.emit(eventName, payload);
};
