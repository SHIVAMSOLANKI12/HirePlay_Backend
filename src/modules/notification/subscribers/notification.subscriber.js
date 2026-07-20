import { eventEngine } from "../events/event.engine.js";
import { NOTIFICATION_EVENTS } from "../constants/notification.events.js";
import { processNotificationEvent } from "../services/notification.service.js";
import { queueManager } from "../queue/queue.manager.js";
import prisma from "../../../config/prisma.js";

/**
 * Reusable Event Subscriber
 * Listens to all defined notification events and passes them to the service.
 */
export const registerNotificationSubscribers = () => {
  Object.values(NOTIFICATION_EVENTS).forEach(eventName => {
    if (eventName === NOTIFICATION_EVENTS.NOTIFICATION_CREATED) return;
    
    eventEngine.on(eventName, async (payload) => {
      try {
        const dbNotification = await processNotificationEvent(payload);
        
        if (!dbNotification) return;

        console.log(`[Subscriber] Successfully handled event ${eventName}`);

        // If the notification is an EMAIL, pass it to the Queue
        if (dbNotification.channel === "EMAIL") {
          // Update status to QUEUED
          await prisma.notification.update({
            where: { id: dbNotification.id },
            data: { status: "QUEUED", queuedAt: new Date() }
          });
          
          await queueManager.enqueueNotification(dbNotification.id, {
            eventName: eventName
          });
        }
      } catch (error) {
        console.error(`[Subscriber] Error handling event ${eventName}: ${error.message}`);
      }
    });
  });

  console.log("Notification subscribers registered successfully.");
};
