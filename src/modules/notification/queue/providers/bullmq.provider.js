import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export default class BullMQProvider {
  constructor() {
    this.redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      maxRetriesPerRequest: null
    });

    this.redisConnection.on('ready', () => {
      console.log('✅ [BullMQProvider] Successfully connected to Redis (Queue Manager)');
    });
    
    this.emailQueue = new Queue('email-notifications', {
      connection: this.redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 100
      }
    });
  }

  /**
   * Adds a job to the queue
   * @param {string} queueName 
   * @param {string} jobId 
   * @param {object} payload 
   */
  async addJob(queueName, jobId, payload) {
    if (queueName === 'email-notifications') {
      const job = await this.emailQueue.add('send-email', {
        notificationId: jobId,
        ...payload
      });
      return { id: job.id, status: 'QUEUED' };
    }
    throw new Error(`Queue ${queueName} not supported in BullMQProvider`);
  }
}
