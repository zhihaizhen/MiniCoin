import { BaseClient } from '../base';
import { wsHost } from '../config';
import {
  SpotRealTimeResp,
  SpotMessageResp,
  isSpotPong,
  isSpotMessageData
} from './types';

let timeout = 0;

const _24HoursAgo = 1000 * 60 * 60 * 24 - 1000;

const realTimesTransform = function (m): SpotRealTimeResp {
  return {
    startTime: +m.t - _24HoursAgo,
    currentTime: +m.t,
    symbol: m.s,
    close: m.c,
    high: m.h,
    low: m.l,
    open: m.o,
    volume: m.v,
    quoteVolume: m.qv,
    range: m.m,
    originData: {
      ...m
    }
  };
};

export class SpotWss extends BaseClient {
  private static _instance: SpotWss;
  private constructor() {
    super(wsHost + '/spot/ws/quote/v1');
    // 启动心跳
    this.heartCheck();

    this.on('message', (event: SpotMessageResp) => {
      if (isSpotPong(event)) {
        return;
      }
      if (isSpotMessageData(event)) {
        const { topic, data } = event;
        switch (topic) {
          case 'realtimes': {
            this.emit(
              'realtimes',
              (data as Array<any>).map((m) => realTimesTransform(m))
            );
            break;
          }
          // case 'slowBroker': {
          //   console.log(data);
          //   break;
          // }
        }
      }
    });
  }
  // 获得实例对象
  public static getInstance(): SpotWss {
    // 为了避免在一个窗口中打开了多个socket
    if (!window['_SpotWssClient']) {
      this._instance = new SpotWss();
      window['_SpotWssClient'] = this._instance;
    } else {
      this._instance = window['_SpotWssClient'];
    }
    return this._instance;
  }

  ping() {
    this.send({ ping: Date.now() });
  }

  heartCheck() {
    setInterval(() => {
      if (timeout <= 0) {
        this.ping();
        timeout = 10;
      } else {
        timeout -= 1;
      }
    }, 1000);
  }

  /**
   * 按Symbol刷新的24小時完整ticker信息, 300ms推送一次，最大延遲400ms。
   * @param symbol
   */
  sendRealTimes(symbol: string) {
    this.send({
      topic: 'realtimes',
      event: 'sub',
      symbol,
      params: {
        binary: false
      }
    });
    //  全量获取数据，不建议使用
    // this.send({
    //   id: 'broker',
    //   topic: 'slowBroker',
    //   event: 'sub',
    //   params: {
    //     binary: false,
    //     symbol,
    //     realtimeInterval: '24h'
    //   }
    // });
  }
}
