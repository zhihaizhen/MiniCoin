class EventEmitter {
  constructor() {
    this.listenerMap = new Map();
    this.maxListeners = 10;
  }

  setMaxListeners(max) {
    this.maxListeners = max;
  }

  isFunction = (f) => {
    return typeof f === 'function';
  };

  // 判断某事件是否已被监听, 或某句柄是否存在
  existsListener(eventName, handler) {
    const listeners = this.listenerMap.get(eventName) || [];

    return handler ? listeners.indexOf(handler) > -1 : listeners.length > 0;
  }

  removeListener(eventName, handler) {
    const listeners = this.listenerMap.get(eventName) || [];
    const index = listeners.indexOf(handler);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  on(eventName, handler) {
    if (!this.isFunction(handler)) return this;

    const listeners = this.listenerMap.get(eventName) || [];

    if (!listeners.indexOf(handler) > -1) {
      listeners.push(handler);
      if (listeners.length > this.maxListeners) {
        // eslint-disable-next-line no-console
        console.warn(
          `Too many listeners of event: ${eventName} (${listeners.length})`,
        );
      }
    }

    this.listenerMap.set(eventName, listeners);

    return this;
  }

  emit(eventName, ...args) {
    const listeners = this.listenerMap.get(eventName) || [];

    listeners.forEach((cb) => cb(...args));

    return this;
  }

  off(eventName, handler) {
    this.removeListener(eventName, handler);
  }
}

export default EventEmitter;
