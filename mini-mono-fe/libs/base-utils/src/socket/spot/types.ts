import { Interval_Str } from '../types';

// 心跳
export interface SpotPing {
  ping: number;
}
export interface SpotPong {
  pong: number;
}

export type SpotTopic =
  | 'slowBroker' // 全量获取数据，不建议使用
  | 'realtimes' // 24小时数据
  | 'trade' // 交易数据
  | 'kline' // k线图
  | 'depth' // 深度信息
  | 'mergedDepth'
  | 'diffDepth'
  | 'lt'
  | 'bookTicker';

//  订阅：send({event:"sub"}) 取消订阅 send({event:"cancel"})
export type SpotEvent = 'sub' | 'cancel';

export interface SpotMessage {
  id?: string; //
  symbol?: string; // 支持多个币种联合 比如："BTCUSDT,ETHUSDT"
  topic: SpotTopic;
  event: SpotEvent;
  params: {
    binary: boolean;
    realtimeInterval?: Interval_Str;
    klineType?: Interval_Str;
    dumpScale?: number;
    symbol?: string;
  };
}

export type SpotMessageReq = SpotPing | SpotMessage;

export function isSpotPong(it: SpotMessageResp): it is SpotPong {
  return (it as SpotPong).pong !== undefined;
}

export function isSpotMessageData(it: SpotMessageResp): it is SpotMessageData {
  return (it as SpotMessageData).data !== undefined;
}

export interface SpotMessageData {
  symbol: string; //
  symbolName?: string;
  topic: SpotTopic;
  data: unknown;
}

export type SpotMessageResp = SpotPong | SpotMessageData;

export interface SpotRealTimeResp {
  startTime: number; // 开始统计时间
  currentTime: number; //	当前時間（撮合引擎撮合时间）
  symbol: string; //	幣對
  close: string; //	收盤價(当前价)
  high: string; //最高價
  low: string; //最低價
  open: string; //開盤價
  volume: string; // 成交量
  quoteVolume: string; //	成交金額
  range: string; // 涨跌幅

  originData: unknown;
}
