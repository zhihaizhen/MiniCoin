/* eslint-disable */
import WS from 'by-ws';
import { sendReportData } from '@/services/monitor.service';
import { WS_HOST } from 'common/utils/host';
import { getWsToken } from '@/services/user.service';
import { consoleLogWs } from 'common/utils/consoleLogWs';
class EnhancedWS extends WS {
  constructor(uri, opts) {
    super(uri, opts);
    this.authing = false; // 认证
    this.authed = false; // 认证通过
    // this.reAuthAttempts = 0; // 重新认证
    // this.reAuthAttemptsMax = 2;
    // this.reAuthDelay = 500;
    this.channels = {}; // 重连的共有推送
    this._toChannels = {}; // 共有推送
    this.privateChannels = {}; // 重连的私有推送
    this._toPrivateChannels = {}; // 私有推送
    this.configListeners();
    this._socketId = '';
    this._main = opts.main || false;
    this.tracker = {};
    this.trackTimeout = 0;
    this.reconnectHandlers = [];
    this.keepAliveWhenInactive = opts.keepAliveWhenInactive || false;
    this.isVisible = !document.hidden;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Add ping interval override for inactive tabs
    this.activePingInterval = opts.pingInterval || 5000;
    this.inactivePingInterval = opts.inactivePingInterval || 15000;
  }

  registerReconnectHandler(handler) {
    this.reconnectHandlers.push(handler);
  }

  unregisterReconnectHandler(handler) {
    const handlerIdx = this.reconnectHandlers.indexOf(handler);
    this.reconnectHandlers.splice(handlerIdx, 1);
  }

  configListeners() {
    const subsAllChannels = () => {
      const wsot = new Date().getTime() - this.openStart;
      // 发送订阅公用channel
      const pbKeys = Object.keys(this.channels);
      if (pbKeys.length > 0) {
        this.subscribe(pbKeys);
      }
      // 发送订阅私有channel
      const pcKeys = Object.keys(this.privateChannels);
      if (pcKeys.length > 0) {
        this.subscribe(pcKeys);
      }
    };
    const subsToChannels = () => {
      const wsfct = new Date().getTime() - this.connectStart;
      // console.log(this._toChannels);
      // 发送订阅公用channel
      const pbKeys = Object.keys(this._toChannels);
      if (pbKeys.length > 0) {
        this.subscribe(pbKeys);
        this._toChannels = {};
      }
      // 发送订阅私有channel
      const pcKeys = Object.keys(this._toPrivateChannels);
      if (pcKeys.length > 0) {
        this.subscribe(pcKeys);
        this._toPrivateChannels = {};
      }
    };

    //
    this.on('connect', () => {
      subsToChannels();
    });

    this.on('reconnect', (total_reconnect_num) => {
      consoleLogWs(
        'enhancews-reconnect-total',
        window.navigator.onLine,
        total_reconnect_num,
        this.getUrl(),
      );

      // if (window.navigator.onLine) {
      //   sendReportData({
      //     type: 'error',
      //     errorType: 'wsError',
      //     reconnectNum: total_reconnect_num,
      //     reconnectUrl: this.getUrl(),
      //   });
      // }

      (this.reconnectHandlers || []).forEach((cb) => cb());
      subsAllChannels();
    });

    this.on('reconnect_attempt', (num) => {
      consoleLogWs('enhancews-reconnect-次数', num);
      if (window.navigator.onLine) {
        getWsToken().then((token) => {
          if (token) {
            const wsURL = localStorage.getItem('WSPATH');
            const url = `${WS_HOST}/${wsURL}?v=2&token=${token}`;
            this.changeUrl(url);
          }
        });
      }
    });

    this.on('close', ({ code, reason }) => {
      const networkType = window.navigator.onLine;
      consoleLogWs('enhancews-close-----', code, reason, networkType);

      // Always try to reconnect if we're online, regardless of visibility
      if (networkType) {
        getWsToken().then((token) => {
          if (token) {
            const wsURL = localStorage.getItem('WSPATH');
            const url = `${WS_HOST}/${wsURL}?v=2&token=${token}`;
            consoleLogWs('enhancews-changeurl token', token, url);
            this.changeUrl(url);
            // Force reconnect
            this.reconnect();
          }
        });
      }

      this.authed = false;
      if (code === 1000) {
        this.channels = {};
        this._toChannels = {};
        this.privateChannels = {};
        this._toPrivateChannels = {};
      }
    });

    this.on('open_error', ({ code, reason }) => {
      consoleLogWs('enhancews-open_error', code, reason);
    });
    this.on('heart_error', ({ code, reason }) => {
      consoleLogWs('enhancews-heart_error', code, reason);
    });
    this.on('heart_back', ({ code, reason }) => {
      consoleLogWs('enhancews-heart_back', code, reason);
    });
    this.on('subscribe_success', (socketId) => {
      consoleLogWs('ws-subscribe_success', socketId);
      this._socketId = socketId;
    });
    this.on('subscribe_fail', (socketId) => {
      consoleLogWs('ws-subscribe_fail', socketId);
      this._socketId = socketId;
      this.onClose();
    });
  }

  subscribe(subs = []) {
    consoleLogWs('ws-subscribe', subs);
    this.send({ op: 'subscribe', args: subs });
  }

  unsubscribe(unsubs = []) {
    this.send({ op: 'unsubscribe', args: unsubs });
  }

  channel(topic, callback, force) {
    if (this.readyState === 'closed_user') return null;
    const has = this.channels[topic];
    // 如果当前topic没有订阅或者需要强制订阅
    if (!has || force) {
      this.channels[topic] = callback;
      this.on(topic, callback);
      if (this.connected) {
        if (has && force) {
          this.unsubscribe([topic]);
        }
        this.subscribe([topic]);
      } else {
        this._toChannels[topic] = callback;
      }
    }
  }

  // 定义私有推送的topic
  private(topic, callback) {
    if (this.readyState === 'closed_user') return null;
    if (!this.privateChannels[topic]) {
      // Hijack the callback for event record
      const hijackCallback = (resp) => {
        // if (topic === 'private.wallet' || topic === 'private.new_position') {
        //   this.tracker[topic] = this.tracker[topic] ? this.tracker[topic] + 1 : 1;
        //   if (!this.trackTimeout) {
        //     this.trackTimeout = setTimeout(() => {
        //       Object.keys(this.tracker).forEach((key) => {
        //
        //       });
        //       this.trackTimeout = 0;
        //       this.tracker = {};
        //     }, 30 * 1000);
        //   }
        // } else {
        //
        // }
        return callback(resp);
      };

      this.privateChannels[topic] = hijackCallback;
      this.on(topic, hijackCallback);

      if (this.connected) {
        // if (this.authed) {
        //   this.subscribe([topic]);
        // } else {
        //   this.login(() => {
        //     this.subscribe([topic]);
        //   });
        // }
        this.subscribe([topic]);
      } else {
        this._toPrivateChannels[topic] = callback;
      }
    }
  }

  // 内部方法  login
  login(cb) {
    if (this.connected) {
      // if (!this.authing) {
      //   this.authing = true;
      //   this.send({ op: 'login', args: [getToken()] });
      // }
      const success = () => {
        // this.off('login_fail', fail);
        this.authed = true;
        this.authing = false;
        if (typeof cb === 'function') {
          cb();
        }
      };
      const fail = () => {
        //console.error('login_fail');
        this.authed = false;
        this.authing = false;
        this.off('login_success', success);
      };
      this.once('login_success', success);
      this.once('login_fail', fail);
    }
  }

  leave(topic) {
    if (this.channels[topic]) {
      this.off(topic, this.channels[topic]);
      delete this.channels[topic];
      if (this.connected) {
        this.unsubscribe([topic]);
      } else {
        delete this._toChannels[topic];
      }
    }
    if (this.privateChannels[topic]) {
      this.off(topic, this.privateChannels[topic]);
      delete this.privateChannels[topic];
      if (this.connected) {
        this.unsubscribe([topic]);
      } else {
        delete this._toPrivateChannels[topic];
      }
    }
  }

  handleVisibilityChange() {
    const wasVisible = this.isVisible;
    this.isVisible = !document.hidden;

    // Adjust ping interval based on visibility
    if (this.isVisible !== wasVisible) {
      this.pingInterval = this.isVisible
        ? this.activePingInterval
        : this.inactivePingInterval;

      // Force reconnect if connection was lost while inactive
      if (this.isVisible && !this.connected && window.navigator.onLine) {
        getWsToken().then((token) => {
          if (token) {
            const wsURL = localStorage.getItem('WSPATH');
            const url = `${WS_HOST}/${wsURL}?v=2&token=${token}`;
            this.changeUrl(url);
            this.reconnect();
          }
        });
      }
    }
  }

  // Override the parent WS class's setPing method
  setPing() {
    clearTimeout(this.pingIntervalTimer);
    // Use different ping intervals for active/inactive states
    const interval = this.isVisible
      ? this.activePingInterval
      : this.inactivePingInterval;

    this.pingIntervalTimer = setTimeout(() => {
      if (this.debug)
        console.log('%c[socket]', 'color: #49c9c9;', 'WS send ping');
      this.ping();
      this.onHeartbeat(this.pingTimeout);
    }, interval);
  }

  destroy() {
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
    super.destroy();
  }
}

export default EnhancedWS;
