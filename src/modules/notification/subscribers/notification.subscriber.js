import { eventEngine } from "../events/event.engine.js";
import { NOTIFICATION_EVENTS } from "../constants/notification.events.js";
import { processNotificationEvent } from "../services/notification.service.js";

/**
 * Reusable Event Subscriber
 * Listens to all defined notification events and passes them to the service.
 */
export const registerNotificationSubscribers = () => {
  // We can listen to specific events or create a wildcard listener.
  // For explicitly defined events in our constants:
  Object.values(NOTIFICATION_EVENTS).forEach(eventName => {
    eventEngine.on(eventName, async (payload) => {
      // payload expects: { companyId, userId, title, message, type, channel, metadata }
      await processNotificationEvent(payload);
    });
  });

  console.log("Notification subscribers registered successfully.");
};
