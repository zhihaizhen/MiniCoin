import { EventEmitter } from 'events';
import Backoff from 'backo2';
import { WS_HOST } from 'common/utils/host';

const getRealWSUrl = (path) => `${WS_HOST}/${path}`;

class BaseWebSocket extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.uri = url;
    const {
      debug = false,
      closeCode,
      autoConnect = true,
      reconnectionAttempts = Infinity,
      reconnectionDelay = 1000,
      reconnectionDelayMax = 5000,
      reconnectionReportThreshold = 3,
      reconnectionReportInterval = 3,
      reconnectionReportMax = 22,
      randomizationFactor = 0.5,
      timeout = 10000,
      reconnection = true,
      protocols,
      pingInterval = 5000,
    } = options;

    this.closeCode = Array.isArray(closeCode) ? closeCode : [closeCode || 1000];
    this.protocols = protocols;
    this.debug = debug;
    this.autoConnect = autoConnect;
    this.reconnection = reconnection;
    this.reconnectionReportThreshold = reconnectionReportThreshold;
    this.reconnectionReportInterval = reconnectionReportInterval;
    this.reconnectionReportMax = reconnectionReportMax;
    this._reconnectionAttempts = reconnectionAttempts;
    this._reconnectionDelay = reconnectionDelay;
    this._reconnectionDelayMax = reconnectionDelayMax;
    this._randomizationFactor = randomizationFactor;
    this._timeout = timeout;

    this.backoff = new Backoff({
      min: this._reconnectionDelay,
      max: this._reconnectionDelayMax,
      jitter: this._randomizationFactor,
    });

    this.ws = null;
    this.connected = false;
    this.readyState = 'closed';
    this.reconnecting = false;
    this.skipReconnect = false;
    this.pingIntervalTimer = null;
    this.pingTimeoutTimer = null;
    this.heartError = false;
    this.pingInterval = pingInterval;
    this.pingTimeout = 3000;
    this.ev = [];
    this.connectStart = Date.now();
    this.openStart = null;
    this.lastPingTime = Date.now();
    this.lastPongTime = Date.now();
    this.heartbeatRetries = 0;
    this.maxHeartbeatRetries = 3;
    this.pingScheduled = false;
    this.keepAliveInterval = null;
    this.reconnectTimer = null;
    this.networkRecoveryTimer = null;
    this.changeUrlTimer = null;
    this.dataTimers = [];

    this.isVisible = !document.hidden;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Add network state handling
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);

    // Add reconnection debounce tracking
    this.lastReconnectAttempt = 0;
    this.minReconnectInterval = 3000; // Minimum 3 seconds between reconnect attempts

    if (this.autoConnect) {
      this.open();
    }
  }

  handleVisibilityChange() {
    const wasVisible = this.isVisible;
    this.isVisible = !document.hidden;

    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        `Visibility changed: ${this.isVisible ? 'visible' : 'hidden'}`,
        `Connected: ${this.connected}`,
        `ReadyState: ${this.readyState}`,
        `Last ping: ${new Date(this.lastPingTime).toLocaleTimeString()}`,
      );
    }

    if (this.isVisible !== wasVisible) {
      if (this.isVisible) {
        if (this.connected && this.readyState === 'open') {
          const now = Date.now();
          const timeSinceLastPing = now - this.lastPingTime;
          if (timeSinceLastPing > this.pingInterval * 1.5) {
            if (this.debug) {
              console.log(
                '%c[socket]',
                'color: #49c9c9;',
                'Tab visible - sending ping after long interval',
                `Time since last ping: ${timeSinceLastPing}ms`,
              );
            }
            this.sendPing();
          }
        }
      }
      this.setupKeepAlive();
    }
  }

  setupKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    this.keepAliveInterval = setInterval(() => {
      if (!this.connected || this.readyState !== 'open' || !this.ws) return;

      const now = Date.now();
      const timeSinceLastPing = now - this.lastPingTime;

      if (timeSinceLastPing >= this.pingInterval) {
        this.sendPing();
      }
    }, 1000);
  }

  sendPing() {
    if (
      !this.connected ||
      this.readyState !== 'open' ||
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    try {
      const now = new Date();
      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          `WS send ping at ${now.toLocaleTimeString()}.${now.getMilliseconds()}`,
        );
      }
      this.lastPingTime = Date.now();
      this.send({ op: 'ping', args: [this.lastPingTime] });
      this.startHeartbeatCheck();
    } catch (err) {
      console.error('Failed to send ping:', err);
      if (this.reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    }
  }

  startHeartbeatCheck() {
    if (this.pingTimeoutTimer) {
      clearTimeout(this.pingTimeoutTimer);
      this.pingTimeoutTimer = null;
    }

    this.pingTimeoutTimer = setTimeout(() => {
      if (!this.connected || this.readyState !== 'open') return;

      const now = Date.now();
      const timeSinceLastPong = now - this.lastPongTime;

      if (timeSinceLastPong > this.pingTimeout) {
        this.heartbeatRetries += 1;

        if (this.heartbeatRetries >= this.maxHeartbeatRetries) {
          const logTime = new Date();
          if (this.debug) {
            console.log(
              '%c[socket]',
              'color: #49c9c9;',
              `Heartbeat failed after ${
                this.maxHeartbeatRetries
              } retries at ${logTime.toLocaleTimeString()}.${logTime.getMilliseconds()}`,
              `Last pong was ${timeSinceLastPong}ms ago`,
            );
          }
          this.emit('heart_error', { code: 4996, reason: 'ping timeout' });
          this.heartError = true;

          if (this.reconnection && !this.skipReconnect) {
            this.reconnect();
          }
        } else {
          const logTime = new Date();
          if (this.debug) {
            console.log(
              '%c[socket]',
              'color: #49c9c9;',
              `Retrying ping, attempt: ${
                this.heartbeatRetries
              } at ${logTime.toLocaleTimeString()}.${logTime.getMilliseconds()}`,
              `Last pong was ${timeSinceLastPong}ms ago`,
            );
          }
          this.sendPing();
        }
      }
    }, this.pingTimeout);
  }

  open() {
    this.openStart = Date.now();
    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'open 开始状态:',
        this.readyState,
        '连接地址：',
        this.uri,
      );
    }
    if (this.readyState === 'open') return;

    try {
      const url = /\?/.test(this.uri)
        ? `${this.uri}&timestamp=${Date.now()}`
        : `${this.uri}?timestamp=${Date.now()}`;
      this.ws = new WebSocket(url, this.protocols);
      this.readyState = 'opening';
      this.skipReconnect = false;
      this.addEventListeners();

      if (this._timeout) {
        const timer = setTimeout(() => {
          this.emit('open_timeout', { code: 4997, reason: 'open_timeout' });
        }, this._timeout);
        this.ev.push({
          destroy: () => clearTimeout(timer),
        });
      }
    } catch (e) {
      if (this.debug) {
        console.error('[socket]创建实例发生错误', e);
      }
      this.emit('open_error', { code: 4998, reason: e.message || e });
    }
  }

  addEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.onOpen();
    };

    this.ws.onclose = ({ code, reason }) => {
      this.onClose({ code, reason });
    };

    this.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (Array.isArray(data)) {
        data.forEach((item) => {
          const timer = setTimeout(() => {
            this.onData(item);
            // 执行后从数组中移除
            this.dataTimers = this.dataTimers.filter(t => t !== timer);
          }, 0);
          this.dataTimers.push(timer);
        });
      } else {
        this.onData(data);
      }
    };

    this.ws.onerror = () => {
      this.onError({ code: 4999, reason: 'onerror' });
    };
  }

  onOpen() {
    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'WS onOpen',
        `URI: ${this.uri}`,
        `Time taken: ${Date.now() - this.openStart}ms`,
      );
    }

    this.connected = true;
    this.readyState = 'open';
    this.reconnecting = false;
    this.backoff.reset();
    this.setupKeepAlive();
    this.emit('connect');
  }

  onData(data) {
    if (data.ping) {
      this.send({ pong: data.ping });
      this.lastPongTime = Date.now();
      return;
    }

    if (data.ret_msg === 'pong' || data.op === 'pong') {
      this.lastPongTime = Date.now();
      this.heartbeatRetries = 0;
      if (this.heartError) {
        this.emit('heart_back', { code: 4995, reason: 'heart_back' });
        this.heartError = false;
      }
      return;
    }

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const timer = setTimeout(() => {
          this.handleMessage(item);
          // 执行后从数组中移除
          this.dataTimers = this.dataTimers.filter(t => t !== timer);
        }, 0);
        this.dataTimers.push(timer);
      });
    } else {
      this.handleMessage(data);
    }
  }

  handleMessage(data) {
    this.emit('message', data);
  }

  onClose({ code, reason }) {
    const now = new Date();
    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'WS prototype onClose 执行:',
        reason,
        `at ${now.toLocaleTimeString()}.${now.getMilliseconds()}`,
        `code: ${code}`,
        `heartbeatRetries: ${this.heartbeatRetries}`,
        `isVisible: ${this.isVisible}`,
        `manualClose: ${this.manualClose}`,
        `online: ${window.navigator.onLine}`,
      );
    }

    this.clearTimers();
    this.connected = false;
    this.readyState = 'closed';

    if (this.ws && this.ws.readyState < WebSocket.CLOSING) {
      let c = code;
      if (c === 1006) c = 4006;
      else if (c === 1005) c = 4005;

      try {
        this.ws.close(c);
      } catch (err) {
        console.error('Error closing websocket:', err);
      }
    }

    this.clearUp();
    this.emit('close', { code, reason });

    // Don't attempt reconnect if offline or manual close
    if (
      this.closeCode.includes(code) ||
      !window.navigator.onLine ||
      this.manualClose
    ) {
      this.skipReconnect = true;
      this.reconnecting = false;
      this.readyState = 'closed_user';
      this.backoff.reset();
    } else if (this.reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  }

  reconnect() {
    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'WS prototype reconnect 执行:',
        `online: ${window.navigator.onLine}`,
        `reconnecting: ${this.reconnecting}`,
        `skipReconnect: ${this.skipReconnect}`,
        `readyState: ${this.readyState}`,
        `URI: ${this.uri}`,
        `Last attempt: ${new Date(
          this.lastReconnectAttempt,
        ).toLocaleTimeString()}`,
      );
    }

    // Check if we're trying to reconnect too quickly
    const now = Date.now();
    if (now - this.lastReconnectAttempt < this.minReconnectInterval) {
      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          'Reconnect attempted too quickly, debouncing...',
          `Time since last attempt: ${now - this.lastReconnectAttempt}ms`,
        );
      }

      // Schedule a delayed reconnect
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      this.reconnectTimer = setTimeout(() => {
        if (!this.connected && !this.skipReconnect) {
          this.reconnect();
        }
        this.reconnectTimer = null;
      }, this.minReconnectInterval);

      return;
    }

    // Update last attempt time
    this.lastReconnectAttempt = now;

    // Emit event to request new token before reconnecting
    this.emit('before_reconnect');

    if (this.reconnecting || this.skipReconnect || !window.navigator.onLine) {
      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          'Skipping reconnect attempt',
        );
      }
      return;
    }

    // Ensure clean state before reconnecting
    this.clearUp();
    this.connected = false;
    this.readyState = 'closed';

    if (this.backoff.attempts > this._reconnectionAttempts) {
      if (this.debug) console.error('[socket]超过最大重连次数, 重连彻底失败');
      this.backoff.reset();
      this.emit('reconnect_failed');
      this.reconnecting = false;
    } else {
      // Use fixed delay instead of backoff
      const delay = this._reconnectionDelay;
      this.reconnecting = true;

      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          `Scheduling reconnection in ${delay}ms`,
        );
      }

      const timer = setTimeout(() => {
        if (this.skipReconnect) return;

        this.emit('reconnect_attempt', this.backoff.attempts);
        this.emit('reconnecting', this.backoff.attempts);

        if (
          this.backoff.attempts > this.reconnectionReportThreshold &&
          this.backoff.attempts % this.reconnectionReportInterval === 0 &&
          this.backoff.attempts < this.reconnectionReportMax
        ) {
          this.emit('reconnect_report', this.backoff.attempts);
        }

        this.open();
      }, delay);

      this.ev.push({
        destroy: () => clearTimeout(timer),
      });
    }
  }

  send(data) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (err) {
      console.error('Send error:', err);
      this.emit('error', err);
      if (this.reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    }
  }

  clearTimers() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    if (this.pingTimeoutTimer) {
      clearTimeout(this.pingTimeoutTimer);
      this.pingTimeoutTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.networkRecoveryTimer) {
      clearTimeout(this.networkRecoveryTimer);
      this.networkRecoveryTimer = null;
    }
    if (this.changeUrlTimer) {
      clearTimeout(this.changeUrlTimer);
      this.changeUrlTimer = null;
    }
    // 清理所有数据处理的 timer
    this.dataTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.dataTimers = [];
    this.heartbeatRetries = 0;
  }

  clearUp() {
    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'Cleaning up WebSocket connection',
        `Current state: ${this.readyState}`,
        `WS state: ${this.ws?.readyState}`,
      );
    }

    this.clearTimers();

    if (this.ws) {
      // Remove event listeners first
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;

      // Then close if not already closed
      if (this.ws.readyState < WebSocket.CLOSING) {
        try {
          this.ws.close();
        } catch (err) {
          console.error('Error during WebSocket cleanup:', err);
        }
      }

      this.ws = null;
    }

    this.clearEV();
  }

  clearEV() {
    const evLength = this.ev.length;
    for (let i = 0; i < evLength; i += 1) {
      const sub = this.ev.shift();
      sub.destroy();
    }
  }

  close(code = 1005) {
    this.skipReconnect = true;
    this.manualClose = true;
    this.onClose({ code, reason: 'close_by_user' });
  }

  handleNetworkChange() {
    const isOnline = window.navigator.onLine;

    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        `Network state changed: ${isOnline ? 'online' : 'offline'}`,
        `Current state: ${this.readyState}`,
        `Connected: ${this.connected}`,
        `Manual close: ${this.manualClose}`,
        `Is visible: ${this.isVisible}`,
        `Last ping: ${new Date(
          this.lastPingTime,
        ).toLocaleTimeString()}.${new Date(
          this.lastPingTime,
        ).getMilliseconds()}`,
        `Last pong: ${new Date(
          this.lastPongTime,
        ).toLocaleTimeString()}.${new Date(
          this.lastPongTime,
        ).getMilliseconds()}`,
      );
    }

    if (isOnline) {
      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          'Network recovery - checking connection state',
          `Reconnecting: ${this.reconnecting}`,
          `Skip reconnect: ${this.skipReconnect}`,
          `WS state: ${this.ws?.readyState}`,
        );
      }

      // Reset flags when network comes back
      this.manualClose = false;
      this.skipReconnect = false;
      this.reconnecting = false;
      this.backoff.reset();

      if (!this.connected) {
        if (this.debug) {
          console.log(
            '%c[socket]',
            'color: #49c9c9;',
            'Starting reconnection after network recovery',
            `URI: ${this.uri}`,
            `Previous connection duration: ${
              this.lastPongTime - this.connectStart
            }ms`,
          );
        }

        // Force close and cleanup any existing connection
        this.clearUp();

        // Start fresh connection
        if (this.networkRecoveryTimer) {
          clearTimeout(this.networkRecoveryTimer);
        }
        this.networkRecoveryTimer = setTimeout(() => {
          if (this.debug) {
            console.log(
              '%c[socket]',
              'color: #49c9c9;',
              'Initiating new connection after network recovery',
            );
          }
          this.open();
          this.networkRecoveryTimer = null;
        }, 1000);
      } else if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          'Connection already exists, skipping reconnection',
        );
      }
    } else if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'Network offline, closing connection',
        `Connection duration: ${Date.now() - this.connectStart}ms`,
        `Last activity: ${Date.now() - this.lastPongTime}ms ago`,
      );
    }
    this.onClose({ code: 4000, reason: 'network_offline' });
  }

  destroy() {
    this.clearTimers();
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    this.close();
    this.removeAllListeners();
  }

  // Add method to update connection URL
  changeUrl(newUrl) {
    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'Updating WebSocket URL:',
        `Old: ${this.uri}`,
        `New: ${newUrl}`,
      );
    }
    this.uri = getRealWSUrl(newUrl);

    // Close existing connection first
    this.clearUp();
    this.connected = false;
    this.readyState = 'closed';

    // Wait a bit before starting new connection
    if (this.changeUrlTimer) {
      clearTimeout(this.changeUrlTimer);
    }
    this.changeUrlTimer = setTimeout(() => {
      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          'Starting new connection with updated URL',
        );
      }
      // Reset connection state
      this.manualClose = false;
      this.skipReconnect = false;
      this.reconnecting = false;
      this.backoff.reset();

      this.open();
      this.changeUrlTimer = null;
    }, 100);
  }
}

export default BaseWebSocket;
