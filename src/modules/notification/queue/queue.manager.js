import BullMQProvider from "./providers/bullmq.provider.js";

class QueueManager {
  constructor() {
    // Factory pattern: We can swap to AWS SQS or RabbitMQ Provider here based on process.env.QUEUE_PROVIDER
    this.provider = new BullMQProvider();
  }

  async enqueueNotification(notificationId, data) {
    try {
      const result = await this.provider.addJob('email-notifications', notificationId, data);
      console.log(`[QueueManager] Added job ${result.id} for notification ${notificationId}`);
      return result;
    } catch (error) {
      console.error(`[QueueManager] Failed to add job for notification ${notificationId}:`, error);
      throw error;
    }
  }
}

export const queueManager = new QueueManager();
