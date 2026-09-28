import { EventEmitter } from 'events';
import { SpotMessageReq } from './spot/types';

export class BaseClient {
  private _bus: EventEmitter;

  private _client: WebSocket;

  public status: 'init' | 'open' | 'closed' | 'error' = 'init';

  public isShowLog = false;

  public log(...args) {
    if (this.isShowLog) {
      console.log(...args);
    }
  }

  public constructor(uri: string) {
    this._bus = new EventEmitter();
    this._client = new WebSocket(uri);
    this._client.onopen = (event) => {
      this.log('WebSocket: wss is open now.', event);
      this.status = 'open';
      this.emit('open', event);
    };
    this._client.onclose = (event) => {
      this.log('WebSocket: wss is closed.', event);
      this.status = 'closed';
      this.emit('closed', event);
    };
    this._client.onerror = (event) => {
      this.log('WebSocket: wss is error.', event);
      this.status = 'error';
      this.emit('error', event);
    };
    this._client.onmessage = (event) => {
      this.log('WebSocket: wss is message.', event);
      const { data } = event;
      this.emit('message', JSON.parse(data));
    };
  }

  send(data: SpotMessageReq) {
    if (this.status === 'open') {
      this._client.send(JSON.stringify(data));
    }
  }

  emit(evtName: string, data: unknown) {
    this._bus.emit(evtName, data);
  }

  on(evtName: string, cb: (args: unknown) => void) {
    // this.log('WebSocket2: message', evtName);
    this._bus.on(evtName, cb);
    return () => {
      // todo: 这里还不是真正的取消，只是取消了订阅，wss还是会正常的推送的，后面在开发
      return this.off(evtName, cb);
    };
  }

  off(evtName: string, cb: (args: unknown) => void) {
    this._bus.off(evtName, cb);
  }

  getStatus() {
    this.log('WebSocket:', this.status, this._client);
    return this.status;
  }

  showLog() {
    this.isShowLog = true;
  }
}
