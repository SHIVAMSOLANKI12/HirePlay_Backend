import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processEmailNotification } from '../email/services/email.service.js';
import prisma from '../../../config/prisma.js';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

redisConnection.on('ready', () => {
  console.log('✅ [QueueWorker] Successfully connected to Redis (Queue Worker)');
});

export const emailWorker = new Worker('email-notifications', async (job) => {
  const { notificationId } = job.data;
  console.log(`[QueueWorker] Processing job ${job.id} for notification ${notificationId}`);
  
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });
  
  if (!notification) {
    throw new Error(`Notification ${notificationId} not found in database`);
  }
  
  if (notification.status === 'CANCELLED') {
    console.log(`[QueueWorker] Skipping job ${job.id} because notification is CANCELLED`);
    return;
  }
  
  // Inject eventName from queue data into payload for rendering
  const emailNotification = {
    ...notification,
    payload: {
      ...(notification.payload || {}),
      eventName: job.data.eventName
    }
  };
  
  // Process the email (which updates statuses, fetches prefs, renders HBS, sends SMTP)
  // If this throws, BullMQ catches it and applies the retry policy.
  await processEmailNotification(emailNotification);
  
}, { connection: redisConnection });

emailWorker.on('completed', (job) => {
  console.log(`[QueueWorker] Job ${job.id} has completed successfully`);
});

emailWorker.on('failed', async (job, err) => {
  console.error(`[QueueWorker] Job ${job?.id} has failed: ${err.message}`);
  
  // If this is the last attempt, it goes to the DLQ automatically in Redis.
  // The database status is handled by `processEmailNotification` catching its own errors,
  // but if it completely threw before catching, we could handle it here.
  // In `processEmailNotification`, we already wrap in try/catch and call `markEmailAsFailed`.
});
