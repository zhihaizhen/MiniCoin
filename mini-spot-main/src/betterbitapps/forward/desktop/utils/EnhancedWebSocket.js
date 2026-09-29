import BaseWebSocket from './BaseWebSocket';
import { getWsToken } from '@/services/user.service';
import { WS_HOST } from 'common/utils/host';
import { consoleLogWs } from 'common/utils/consoleLogWs';

class EnhancedWebSocket extends BaseWebSocket {
  constructor(url, options = {}) {
    super(url, {
      ...options,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 5000,
    });

    this.channels = {};
    this._toChannels = {};
    this.privateChannels = {};
    this._toPrivateChannels = {};
    this._socketId = '';
    this.authed = false;
    this.manualClose = false;
    this.lastTokenTime = 0;
    this.tokenRefreshInterval = 5000; // 5 seconds between token refreshes
    this.tokenRefreshTimer = null;
    this.tokenRetryTimer = null;

    this.on('connect', this.handleConnect.bind(this));
    this.on('reconnect', this.handleReconnect.bind(this));
    this.on('login_success', this.handleAuthSuccess.bind(this));
    this.on('login_fail', this.handleAuthFail.bind(this));
  }

  handleAuthSuccess() {
    if (this.debug) {
      console.log('%c[socket]', 'color: #49c9c9;', 'WebSocket auth successful');
    }
    this.authed = true;
  }

  handleAuthFail() {
    console.log('WebSocket auth failed, refreshing token and reconnecting');
    this.authed = false;
    // Force a reconnect with new token
    this.lastTokenTime = 0;
    this.reconnect();
  }

  async reconnect() {
    const now = Date.now();
    const timeSinceLastToken = now - this.lastTokenTime;

    if (this.debug) {
      console.log(
        '%c[socket]',
        'color: #49c9c9;',
        'Attempting reconnect:',
        `Time since last token refresh: ${timeSinceLastToken}ms`,
        `Connected: ${this.connected}`,
        `Auth state: ${this.authed}`,
      );
    }

    // If we've recently refreshed the token, wait before trying again
    if (timeSinceLastToken < this.tokenRefreshInterval) {
      if (this.debug) {
        console.log(
          '%c[socket]',
          'color: #49c9c9;',
          'Token refresh attempted too quickly, waiting...',
        );
      }
      // if after 5 seconds, the connection is not established, reconnect
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer);
      }
      this.tokenRefreshTimer = setTimeout(() => {
        if (!this.connected || !this.authed) {
          this.reconnect();
        }
        this.tokenRefreshTimer = null;
      }, this.tokenRefreshInterval);
      return;
    }

    try {
      // Always get fresh token before reconnecting
      const token = await getWsToken();
      if (token) {
        const wsURL = localStorage.getItem('WSPATH');
        const url = `${WS_HOST}/${wsURL}?v=2&token=${token}`;
        this.url = url;
        this.lastTokenTime = Date.now();

        if (this.debug) {
          console.log(
            '%c[socket]',
            'color: #49c9c9;',
            'Got fresh token, reconnecting with new URL',
            url,
          );
        }
      } else {
        throw new Error('Failed to get valid token');
      }
    } catch (err) {
      console.error('Failed to get WS token:', err);
      // Schedule retry
      if (this.tokenRetryTimer) {
        clearTimeout(this.tokenRetryTimer);
      }
      this.tokenRetryTimer = setTimeout(() => {
        if (!this.connected || !this.authed) {
          this.reconnect();
        }
        this.tokenRetryTimer = null;
      }, this.tokenRefreshInterval);
      return;
    }

    super.reconnect();
  }

  handleVisibilityChange() {
    const wasVisible = this.isVisible;
    this.isVisible = !document.hidden;

    if (this.isVisible && !wasVisible) {
      // When tab becomes visible, check connection and auth state
      if (!this.connected || !this.authed) {
        if (this.debug) {
          console.log(
            '%c[socket]',
            'color: #49c9c9;',
            'Tab visible - connection needs refresh',
            `Connected: ${this.connected}`,
            `Auth state: ${this.authed}`,
          );
        }
        this.lastTokenTime = 0; // Force token refresh
        this.reconnect();
      }
    }

    super.handleVisibilityChange();
  }

  handleConnect() {
    this.authed = false;
    this.processSubscriptions();
  }

  handleReconnect() {
    // Handle reconnection
    this.processSubscriptions();
  }

  processSubscriptions() {
    const publicChannels = Object.keys(this._toChannels);
    const privateChannels = Object.keys(this._toPrivateChannels);

    if (publicChannels.length > 0) {
      this.channels = { ...this.channels, ...this._toChannels };
      this.subscribe(publicChannels);
      this._toChannels = {};
    }

    if (privateChannels.length > 0) {
      this.privateChannels = {
        ...this.privateChannels,
        ...this._toPrivateChannels,
      };
      this.subscribe(privateChannels);
      this._toPrivateChannels = {};
    }
  }

  onData(data) {
    const {
      ret_msg,
      topic,
      request,
      success,
      type,
      conn_id,
      ping,
      op,
      timestampE6,
      timestamp_e6,
    } = data;

    if (ping) {
      this.send({ pong: ping });
      return;
    }

    if (op === 'ping') {
      const { op, ...other } = data;
      this.send({ op: 'pong', ...other });
      return;
    }

    if (ret_msg === 'pong') {
      clearTimeout(this.pingTimeoutTimer);
      const now = Date.now();
      const { op, args } = request || {};
      const reqTime = args?.[0];
      if (reqTime && now - reqTime < 3000 && this.heartError) {
        this.emit('heart_back', { code: 4995, reason: 'heart_back' });
        this.heartError = false;
      }
    } else if (topic) {
      const callback = this.channels[topic] || this.privateChannels[topic];
      if (callback) {
        callback({
          type,
          data: data.data,
          timestampE6: timestamp_e6 || timestampE6,
        });
      }
    } else if (request) {
      const { op } = request;
      if (success) {
        this.emit(`${op}_success`, conn_id);
        // Reset auth state on successful subscription
        if (op === 'subscribe') {
          this.authed = true;
        }
      } else {
        this.emit(`${op}_fail`, conn_id);
        // Reset auth state on failed subscription
        if (op === 'subscribe') {
          this.authed = false;
        }
      }
    }
  }

  subscribe(channelsToSubscribe) {
    const channels = Array.isArray(channelsToSubscribe)
      ? channelsToSubscribe
      : [channelsToSubscribe];

    if (!this.connected || channels.length === 0) return;

    consoleLogWs('ws-subscribe', channels);
    this.send({
      op: 'subscribe',
      args: channels,
    });
  }

  unsubscribe(channelsToUnsubscribe) {
    const channels = Array.isArray(channelsToUnsubscribe)
      ? channelsToUnsubscribe
      : [channelsToUnsubscribe];

    this.send({ op: 'unsubscribe', args: channels });
  }

  // Public channel subscription
  channel(topic, callback, force = false) {
    if (!this.connected && this.manualClose) return null;

    const has = this.channels[topic];
    if (!has || force) {
      this.channels[topic] = callback;
      if (this.connected) {
        if (has && force) {
          this.unsubscribe([topic]);
        }
        this.subscribe([topic]);
      } else {
        this._toChannels[topic] = callback;
      }
    }

    return undefined; // Explicit return to satisfy linter
  }

  // Private channel subscription
  private(topic, callback) {
    if (!this.connected && this.manualClose) return null;

    if (!this.privateChannels[topic]) {
      const wrappedCallback = (resp) => callback(resp);
      this.privateChannels[topic] = wrappedCallback;

      if (this.connected) {
        this.subscribe([topic]);
      } else {
        this._toPrivateChannels[topic] = wrappedCallback;
      }
    }

    return undefined;
  }

  leave(topic) {
    if (this.channels[topic]) {
      delete this.channels[topic];
      if (this.connected) {
        this.unsubscribe([topic]);
      } else {
        delete this._toChannels[topic];
      }
    }
    if (this.privateChannels[topic]) {
      delete this.privateChannels[topic];
      if (this.connected) {
        this.unsubscribe([topic]);
      } else {
        delete this._toPrivateChannels[topic];
      }
    }
  }

  bindEvents() {
    super.bindEvents();
  }

  cleanup() {
    if (this.subscriptionTimer) {
      clearTimeout(this.subscriptionTimer);
      this.subscriptionTimer = null;
    }
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    if (this.tokenRetryTimer) {
      clearTimeout(this.tokenRetryTimer);
      this.tokenRetryTimer = null;
    }
    this.subscriptionQueue.clear();
    this.channels = {};
    this.privateChannels = {};
    this._toChannels = {};
    this._toPrivateChannels = {};
    super.cleanup();
  }

  // Reset auth state on connection close
  onClose(event) {
    this.authed = false;
    super.onClose(event);
  }
}

export default EnhancedWebSocket;
