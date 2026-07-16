import EventEmitter from 'events';

class EventEngine extends EventEmitter {}

// We export a singleton instance so the entire application shares the same event bus.
export const eventEngine = new EventEngine();

// Optional: Increase Max Listeners if we anticipate many subscribers
eventEngine.setMaxListeners(20);
