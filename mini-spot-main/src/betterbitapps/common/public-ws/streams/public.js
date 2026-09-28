import { LOG_SWITCH_KEY, WebsocketEvents } from '@region-lib/public-ws';
import { MarketTypes, PublicWsTopics, WS_TYPE } from 'common/constants/kline';
import { getCookie } from 'by-storage';
import allSymbolQuoteStream from 'common/public-ws/streams/allSymbolQuote.stream';
import {
  instrumentStream,
  orderbookStream,
  recentTradeStream,
  depthStream,
} from 'common/public-ws/streams/indexQuoteStream.stream';
import { WS_HOST } from 'common/utils/host';
import worker from '../webworker';

import { markCandleStream, marketCandleStream } from './kline.stream';
import { noticeStream } from './notice.stream';
import { websocketEventStream } from './wsEvent.stream';

worker.postMessage({
  method: 'connect',
  host: WS_HOST,
  showLog: getCookie(LOG_SWITCH_KEY), // fbu.public.ws.log
});

function reportWSOT({ WSOT, socketId }) {}

function reportWSFCT({ WSFCT, socketId }) {}

function reportWebsocketExceptions({ code, reason, socketId }) {}

// NOTICE: 主线程接收 webworker 信息
worker.onmessage = ({ data: { topic, msg } }) => {
  if (!topic) return;
  switch (topic) {
    case MarketTypes.MARK_CANDLE:
      markCandleStream.next(msg);
      break;
    case MarketTypes.MARKET_CANDLE:
      marketCandleStream.next(msg);
      break;
    case WS_TYPE.ALL_SYMBOL_QUOTE:
      allSymbolQuoteStream.next(msg);
      break;
    case WS_TYPE.ALL_SYMBOL_QUOTE_NEW:
      allSymbolQuoteStream.next(msg);
      break;

    case WS_TYPE.ORDER_BOOK:
      orderbookStream.next(msg);
      break;

    case WS_TYPE.RECENTLY_TRADE:
      recentTradeStream.next(msg);
      break;

    // 深度图
    case WS_TYPE.DEPTH:
      depthStream.next(msg);
      break;
    // 单个币对行情
    case WS_TYPE.SINGLE_SYMBOL_QUOTE:
      instrumentStream.next(msg);
      break;

    case WebsocketEvents.CONNECTED:
    case 'connected':
      reportWSFCT(msg);
      break;

    case WebsocketEvents.CLOSE:
    case 'close':
      websocketEventStream.next(topic);
      if (msg) reportWebsocketExceptions(msg);
      break;

    case WebsocketEvents.OPEN_ERROR:
    case WebsocketEvents.HEART_ERROR:
    case WebsocketEvents.HEART_BACK:
    case 'error':
      if (msg) reportWebsocketExceptions(msg);
      break;

    case WebsocketEvents.RECONNECT:
    case 'reconnect':
      websocketEventStream.next(topic);
      reportWSOT(msg);
      break;

    default:
      // eslint-disable-next-line no-console
      console.error(`stream public: ${topic} is not support`);
  }
};

// NOTICE: 主线程让webworker 订阅topic
export function subscribePublicStream(params) {
  worker.postMessage({ method: 'subscribe', ...params });
}

export function unsubscribePublicStream(params) {
  worker.postMessage({ method: 'unsubscribe', ...params });
}

/**
 * orderbookChangeDepth
 * @param depth {{depth: unknown, symbolMeta: *, coin}}
 *
 */

// export function orderbookChangeDepth(depth) {
//   worker.postMessage({ method: 'changeDepth', depth });
// }
