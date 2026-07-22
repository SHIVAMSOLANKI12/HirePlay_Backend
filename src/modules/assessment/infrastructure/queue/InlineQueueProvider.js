import { QueueProvider } from "./QueueProvider.interface.js";

export class InlineQueueProvider extends QueueProvider {
  constructor() {
    super();
    this.handlers = new Map();
  }

  registerHandler(jobName, handlerFn) {
    this.handlers.set(jobName, handlerFn);
  }

  async publish(jobName, payload) {
    const handler = this.handlers.get(jobName);
    if (handler) {
      // Execute asynchronously in background event loop
      setImmediate(async () => {
        try {
          await handler(payload);
        } catch (err) {
          console.error(`[QueueWorker] Job ${jobName} failed:`, err);
        }
      });
    }
  }
}
