import { useEffect, useRef } from 'react';
import {
  LOG_SWITCH_KEY,
  MarketTypes,
  PublicWsTopics,
  WebsocketEvents
} from '@region-lib/public-ws';
import Cookies from 'js-cookie';
import allSymbolQuoteStream from './allSymbolQuote.stream';
import { wsHost } from '../../utils/routerSwitchEvent';
// import worker from '../webworker';
import InitWebWorker from '../webworker';
import { INDEX_QUOTE_TYPE, ORDERBOOK_TYPE } from './category';
import {
  instrumentStream,
  orderbookStream,
  recentTradeStream
} from './indexQuoteStream.stream';
import { markCandleStream, marketCandleStream } from './kline.stream';
import { noticeStream } from './notice.stream';
import { websocketEventStream } from './wsEvent.stream';
import { domainChangeWatchers } from '@region/by-route-finder';

function reportWSOT({ WSOT, socketId }) {}

function reportWSFCT({ WSFCT, socketId }) {}

function reportWebsocketExceptions({ code, reason, socketId }) {}

export function InitWorker() {
  const worker = useRef();
  useEffect(() => {
    worker.current = new Worker(
      new URL('../webworker/marketData.worker.js', import.meta.url)
    );
    domainChangeWatchers.push((item) => {
      worker.current.postMessage({ method: 'changeUrl', host: item.ws2 });
    });
    // const { worker } = InitWebWorker();
    // console.log(InitWebWorker(), 'InitWebWorker');
    if (typeof window !== 'undefined') {
      if (worker) {
        try {
          worker.current.postMessage({
            method: 'connect',
            host: wsHost,
            showLog: Cookies.get(LOG_SWITCH_KEY)
          });
          // NOTICE: 主线程接收 webworker 信息
          worker.current.onmessage = ({ data: { topic, msg } }) => {
            if (!topic) return;
            switch (topic) {
              case MarketTypes.MARK_CANDLE:
                markCandleStream.next(msg);
                break;
              case MarketTypes.MARKET_CANDLE:
                marketCandleStream.next(msg);
                break;
              case INDEX_QUOTE_TYPE.RECENT_TRADE:
              case ORDERBOOK_TYPE.RECENTLY_TRADE:
                // NOTICE: 聚合行情 recent trade
                recentTradeStream.next(msg);
                break;
              case INDEX_QUOTE_TYPE.INSTRUMENT:
                // NOTICE: 聚合行情 instrument
                instrumentStream.next(msg);
                break;
              case INDEX_QUOTE_TYPE.ORDER_BOOK:
              case ORDERBOOK_TYPE.BOOK_20:
              case ORDERBOOK_TYPE.BOOK_25:
              case ORDERBOOK_TYPE.BOOK_80:
              case ORDERBOOK_TYPE.BOOK_200:
                // NOTICE: 聚合行情 order book
                orderbookStream.next(msg);
                break;
              case PublicWsTopics.InstrumentInfo_H:
              case PublicWsTopics.InstrumentInfo_M:
                // NOTICE: 单个 symbol 行情: tickers-100. ,tickers-1000.
                instrumentStream.next(msg);
                break;
              case PublicWsTopics.PublicNotice:
                noticeStream.next(msg);
                break;
              case WebsocketEvents.CONNECTED:
                reportWSFCT(msg);
                break;
              case WebsocketEvents.RECONNECT:
                websocketEventStream.next(topic);
                reportWSOT(msg);
                break;
              case WebsocketEvents.CLOSE:
                websocketEventStream.next(topic);
                if (msg) reportWebsocketExceptions(msg);
                break;
              case WebsocketEvents.OPEN_ERROR:
              case WebsocketEvents.HEART_ERROR:
              case WebsocketEvents.HEART_BACK:
                if (msg) reportWebsocketExceptions(msg);
                break;
              case PublicWsTopics.InstrumentInfoAll:
                // NOTICE: 所有币对行情 =  "tickers.all"
                allSymbolQuoteStream.next(msg);
                break;
              default:
                // eslint-disable-next-line no-console
                console.error(`stream public: ${topic} is not support`);
            }
          };
        } catch (error) {
          console.log(error);
        }
      }
    }

  }, []);

  function subscribePublicStream(params) {
    if (typeof window !== 'undefined' && worker.current) {
      worker.current.postMessage({ method: 'subscribe', ...params });
    }
  }

  function unsubscribePublicStream(params) {
    if (typeof window !== 'undefined' && worker.current) {
      worker.current.postMessage({ method: 'unsubscribe', ...params });
    }
  }

  /**
   * orderbookChangeDepth
   * @param depth {{depth: unknown, symbolMeta: *, coin}}
   *
   */
  function orderbookChangeDepth(depth) {
    if (typeof window !== 'undefined' && worker.current) {
      worker.current.postMessage({ method: 'changeDepth', depth });
    }
  }

  return {
    subscribePublicStream,
    unsubscribePublicStream,
    orderbookChangeDepth
  };
}

// if (typeof window !== 'undefined') {
//   try {
//     worker.postMessage({
//       method: 'connect',
//       host: wsHost,
//       showLog: Cookies.get(LOG_SWITCH_KEY)
//     });
//     // NOTICE: 主线程接收 webworker 信息
//     worker.onmessage = ({ data: { topic, msg } }) => {
//       if (!topic) return;
//       switch (topic) {
//         case MarketTypes.MARK_CANDLE:
//           markCandleStream.next(msg);
//           break;
//         case MarketTypes.MARKET_CANDLE:
//           marketCandleStream.next(msg);
//           break;
//         case INDEX_QUOTE_TYPE.RECENT_TRADE:
//         case ORDERBOOK_TYPE.RECENTLY_TRADE:
//           // NOTICE: 聚合行情 recent trade
//           recentTradeStream.next(msg);
//           break;
//         case INDEX_QUOTE_TYPE.INSTRUMENT:
//           // NOTICE: 聚合行情 instrument
//           instrumentStream.next(msg);
//           break;
//         case INDEX_QUOTE_TYPE.ORDER_BOOK:
//         case ORDERBOOK_TYPE.BOOK_20:
//         case ORDERBOOK_TYPE.BOOK_25:
//         case ORDERBOOK_TYPE.BOOK_80:
//         case ORDERBOOK_TYPE.BOOK_200:
//           // NOTICE: 聚合行情 order book
//           orderbookStream.next(msg);
//           break;
//         case PublicWsTopics.InstrumentInfo_H:
//         case PublicWsTopics.InstrumentInfo_M:
//           // NOTICE: 单个 symbol 行情: tickers-100. ,tickers-1000.
//           instrumentStream.next(msg);
//           break;
//         case PublicWsTopics.PublicNotice:
//           noticeStream.next(msg);
//           break;
//         case WebsocketEvents.CONNECTED:
//           reportWSFCT(msg);
//           break;
//         case WebsocketEvents.RECONNECT:
//           websocketEventStream.next(topic);
//           reportWSOT(msg);
//           break;
//         case WebsocketEvents.CLOSE:
//           websocketEventStream.next(topic);
//           if (msg) reportWebsocketExceptions(msg);
//           break;
//         case WebsocketEvents.OPEN_ERROR:
//         case WebsocketEvents.HEART_ERROR:
//         case WebsocketEvents.HEART_BACK:
//           if (msg) reportWebsocketExceptions(msg);
//           break;
//         case PublicWsTopics.InstrumentInfoAll:
//           // NOTICE: 所有币对行情 =  "tickers.all"
//           allSymbolQuoteStream.next(msg);
//           break;
//         default:
//           // eslint-disable-next-line no-console
//           console.error(`stream public: ${topic} is not support`);
//       }
//     };
//   } catch (error) {
//     console.log(error);
//   }
// }

// NOTICE: 订阅topic
// { topic, symbol, marketType }
export function subscribePublicStream(params) {
  const { worker } = InitWebWorker();
  if (typeof window !== 'undefined' && worker) {
    worker.current.postMessage({ method: 'subscribe', ...params });
  }
}

export function unsubscribePublicStream(params) {
  const { worker } = InitWebWorker();
  if (typeof window !== 'undefined' && worker) {
    worker.postMessage({ method: 'unsubscribe', ...params });
  }
}

/**
 * orderbookChangeDepth
 * @param depth {{depth: unknown, symbolMeta: *, coin}}
 *
 */
export function orderbookChangeDepth(depth) {
  const { worker } = InitWebWorker();
  if (typeof window !== 'undefined' && worker) {
    worker.postMessage({ method: 'changeDepth', depth });
  }
}
