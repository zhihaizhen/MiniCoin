/* eslint-disable no-restricted-globals */
import MiniPublicWs from './miniPbWs/PublicWebSocket';
import { MarketTypes, PublicWsTopics, WS_TYPE } from 'common/constants/kline';

// 公有行情数据中心实例
let miniPublicWs = null;
// subscription
let depthSubscription = null;
let orderBooktSubscription = null;
let recentTradeSubscription = null;
let instrumentSingleSubscription = null;
let instrumentInfoAllSubscription = null;
let instrumentInfoAllNewSubscription = null;
let marketCandleSubscription = null;
let markCandleSubscription = null;

// tickers (ALL_SYMBOL_QUOTE_NEW) batch & incremental state
let tickersBatchCache = null; // { bt, t, full, batches: {} }
let tickersFullData = {}; // accumulated symbol -> item map

const WS_PATHNAME = '/ws/quote/v1';

// webworker接收主线程发送的消息，
//  data 的格式：
// method: "subscribe"
// symbol: "BTCUSDT"
// topic: "realtimes."
self.addEventListener('message', ({ data }) => {
  const { method, host, showLog } = data;
  if (showLog) console.log('[WebWorker] received message:', data);
  if (!method) return null;
  switch (method) {
    case 'connect': {
      // Prevent redundant connection if host is the same
      if (miniPublicWs && miniPublicWs.host === host) {
        if (showLog)
          console.log(
            '[WebWorker] connect ignored: already connected to',
            host,
          );
        break;
      }

      // NOTE: User requested direct new instance creation.
      // If miniPublicWs exists, it will be overwritten (and previous one hopefully GC'd, though events might leak if not cleaned up. Ideally should call cleanup().)
      if (miniPublicWs) {
        miniPublicWs.cleanup();
      }

      miniPublicWs = new MiniPublicWs({
        host,
        showLog,
        pathName: WS_PATHNAME,
      });
      miniPublicWs.websocketEventSubject.subscribe(({ type, data }) => {
        sendMessageToMainThread(type, data);
      });
      break;
    }
    case 'changeUrl':
      miniPublicWs.changeUrl(host);
      break;
    case 'subscribe':
      subscribeTopic(data);
      break;
    case 'unsubscribe':
      if (showLog) {
        console.log('[WebWorker] unsubscribe called with data:', data);
      }
      unsubscribeTopic(data);
      break;
    case 'changeDepth':
      miniPublicWs.changeDepth(data.depth);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error('method not support');
  }
  return null;
});

// NOTICE: webworkder postmessage to 主线程
const sendMessageToMainThread = (topic, msg) => {
  try {
    self.postMessage({ topic, msg });
  } catch (e) {
    console.error('[WebWorker] sendMessageToMainThread failed', e, topic);
  }
};

// tickers array field indices → slowbroker object shape
// [symbol, close, high, low, open, volume, quoteVolume, market]
const parseTickerItem = (item, timestamp) => ({
  t: timestamp,
  s: item[0],
  sn: item[0],
  c: item[1],
  h: item[2],
  l: item[3],
  o: item[4],
  v: item[5],
  qv: item[6],
  m: item[7],
  e: 301,
});

const processTickersUpdate = (topic, dataArr, timestamp, isFull) => {
  const parsed = {};
  dataArr.forEach((item) => {
    const symbol = item[0];
    parsed[symbol] = parseTickerItem(item, timestamp);
  });

  if (isFull) {
    tickersFullData = parsed;
  } else {
    tickersFullData = { ...tickersFullData, ...parsed };
  }

  if (Object.keys(tickersFullData).length) {
    sendMessageToMainThread(topic, tickersFullData);
  }
};

const handlerNewAllSymbolQuoteData = (topic, result) => {
  const { full, t, bi, bt, data } = result;
  if (!Array.isArray(data) || !data.length) return;

  if (bt > 1) {
    // Reset accumulator when a new full snapshot begins (bi === 1)
    if (!tickersBatchCache || (full && bi === 1)) {
      tickersBatchCache = { bt, t, full, batches: {} };
    }
    tickersBatchCache.batches[bi] = data;

    // Wait until all batches have arrived
    if (Object.keys(tickersBatchCache.batches).length < bt) return;

    // Merge batches in order then process
    const merged = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= bt; i++) {
      if (tickersBatchCache.batches[i])
        merged.push(...tickersBatchCache.batches[i]);
    }
    const { full: mergedFull, t: mergedT } = tickersBatchCache;
    tickersBatchCache = null;
    processTickersUpdate(topic, merged, mergedT, mergedFull);
  } else {
    processTickersUpdate(topic, data, t, full);
  }
};

const handlerAllSymbolQuoteData = (topic, result) => {
  if (!Object.keys(result).length) return;
  const { data } = result;
  const allSymbolQuoteData = {};
  data.forEach((item) => {
    // allSymbolQuoteData[item.sn] = item;  // sn = BTCUSDT
    allSymbolQuoteData[item.s] = item; // s = BTCUSDT
  });
  // console.log('handlerAllSymbolQuoteData1111', result, allSymbolQuoteData);
  sendMessageToMainThread(topic, allSymbolQuoteData);
};

// NOTICE: webworker 订阅 topic & 响应
const subscribeTopic = (data) => {
  const { topic, symbol, obDepthInfo, marketType, resolution } = data;
  // console.log('step1-subscribeTopic1', topic, symbol, marketType, resolution);

  if (marketType) {
    miniPublicWs.subscribeTopicDirect(data);
    switch (marketType) {
      case MarketTypes.MARKET_CANDLE:
        marketCandleSubscription = miniPublicWs.marketCandleSubject.subscribe(
          (res) => {
            sendMessageToMainThread(MarketTypes.MARKET_CANDLE, res);
          },
        );
        break;
      case MarketTypes.MARK_CANDLE:
        markCandleSubscription = miniPublicWs.markCandleAllSubject.subscribe(
          (res) => {
            // console.log("marketCandleSubscription:",res.data);
            sendMessageToMainThread(MarketTypes.MARK_CANDLE, res);
          },
        );
        break;
      default:
      // eslint-disable-next-line no-console
      //  console.log(`webwork => ${marketType} not support`);
    }
  } else {
    miniPublicWs.subscribeTopic({ topic, symbol, obDepthInfo });
    switch (topic) {
      case WS_TYPE.ORDER_BOOK:
        orderBooktSubscription = miniPublicWs.orderBookSubject.subscribe(
          (res) => {
            sendMessageToMainThread(topic, res);
          },
        );
        break;
      case WS_TYPE.DEPTH:
        depthSubscription = miniPublicWs.depthSubject.subscribe((res) => {
          sendMessageToMainThread(topic, res);
        });
        break;

      case WS_TYPE.SINGLE_SYMBOL_QUOTE:
        instrumentSingleSubscription = miniPublicWs.instrumentSubject.subscribe(
          (res) => {
            sendMessageToMainThread(topic, res);
          },
        );
        break;

      case WS_TYPE.RECENTLY_TRADE:
        recentTradeSubscription = miniPublicWs.recentTradeSubject.subscribe(
          (res) => {
            sendMessageToMainThread(topic, res);
          },
        );
        break;
      case WS_TYPE.ALL_SYMBOL_QUOTE:
        instrumentInfoAllSubscription =
          miniPublicWs.allSymbolQuoteSubject.subscribe((res) => {
            handlerAllSymbolQuoteData(topic, res);
          });
        break;
      case WS_TYPE.ALL_SYMBOL_QUOTE_NEW:
        instrumentInfoAllNewSubscription =
          miniPublicWs.allSymbolQuoteNewSubject.subscribe((res) => {
            handlerNewAllSymbolQuoteData(topic, res);
          });
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(`webwork => ${topic} not support`);
    }
  }
};

const unsubscribeTopic = ({ topic, symbol, marketType, obDepthInfo }) => {
  if (marketType) {
    if (topic.includes('kline')) {
      marketCandleSubscription.unsubscribe();
    } else {
      markCandleSubscription.unsubscribe();
    }
    miniPublicWs.unsubscribeTopicDirect(topic, true);
  } else {
    switch (topic) {
      case WS_TYPE.RECENTLY_TRADE:
        recentTradeSubscription.unsubscribe();
        break;

      case WS_TYPE.SINGLE_SYMBOL_QUOTE:
        instrumentSingleSubscription.unsubscribe();
        break;

      case WS_TYPE.DEPTH:
        depthSubscription.unsubscribe();
        break;

      case WS_TYPE.ORDER_BOOK:
        orderBooktSubscription.unsubscribe();
        break;

      case WS_TYPE.ALL_SYMBOL_QUOTE:
        instrumentInfoAllSubscription.unsubscribe();
        break;
      case WS_TYPE.ALL_SYMBOL_QUOTE_NEW:
        instrumentInfoAllNewSubscription.unsubscribe();
        break;
      default: {
        console.log(`webwork => unsubscribe ${topic} not support`);
      }
    }
    miniPublicWs.unsubscribeTopic({ topic, symbol, obDepthInfo });
  }
};
