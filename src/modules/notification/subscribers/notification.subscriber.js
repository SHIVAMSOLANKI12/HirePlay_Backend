import { eventEngine } from "../events/event.engine.js";
import { NOTIFICATION_EVENTS } from "../constants/notification.events.js";
import { processNotificationEvent } from "../services/notification.service.js";
import { processEmailNotification } from "../email/services/email.service.js";
// import logger from "../../../config/logger.js";

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
      try {
        const dbNotification = await processNotificationEvent(payload);
        console.log(`[Subscriber] Successfully handled event ${eventName}`);

        // If the notification is an EMAIL, pass it to the Email Engine
        // In Sprint 3 this will be sent to BullMQ. For now, process synchronously (fire & forget style)
        if (dbNotification.channel === "EMAIL") {
          // Ensure eventName is available for template resolution
          const emailNotification = {
            ...dbNotification,
            payload: {
              ...(dbNotification.payload || {}),
              eventName: eventName
            }
          };

          processEmailNotification(emailNotification).catch(err => {
            console.error(`[Subscriber] Background email processing failed: ${err.message}`);
          });
        }
      } catch (error) {
        console.error(`[Subscriber] Error handling event ${eventName}: ${error.message}`);
      }
    });
  });

  console.log("Notification subscribers registered successfully.");
};
