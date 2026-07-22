/**
 * Interface / Base Class for Background Job Queue Providers.
 * Ready for BullMQ, RabbitMQ, Kafka, or Inline processing.
 */
export class QueueProvider {
  /**
   * Publishes a job to the background queue.
   * @param {string} jobName
   * @param {Object} payload
   * @returns {Promise<void>}
   */
  async publish(jobName, payload) {
    throw new Error("publish() must be implemented by concrete queue provider");
  }
}
