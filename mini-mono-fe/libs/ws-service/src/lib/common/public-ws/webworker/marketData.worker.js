/* eslint-disable no-restricted-globals */
import ByFbuPublicWs, {
  MarketTypes,
  PublicWsTopics,
  WS_PATHNAME_ZM
} from '@region-lib/public-ws';
import { INDEX_QUOTE_TYPE, ORDERBOOK_TYPE } from '../streams/category';

// 公有行情数据中心实例
let byFbuPublicWs = null;
// subscription
let instrumentSubscription = null;
let orderBooktSubscription = null;
let recentTradeSubscription = null;
let instrumentSingleSubscription = null;
let marketCandleSubscription = null;
let markCandleSubscription = null;
let instrumentInfoAllSubscription = null;
let publicNoticeSubscription = null;

if (typeof window !== 'undefined') {
  self.addEventListener('message', ({ data }) => {
    console.log('message');
    const { method, host, showLog } = data;
    if (!method) return null;
    switch (method) {
      case 'connect': {
        byFbuPublicWs = new ByFbuPublicWs({
          host,
          showLog,
          pathName: WS_PATHNAME_ZM
        });
        byFbuPublicWs.websocketEventSubject.subscribe(({ type, data }) => {
          sendMessageToMainThread(type, data);
        });
        break;
      }
      case 'changeUrl':
        byFbuPublicWs.changeUrl(host);
        break;
      case 'subscribe':
        subscribeTopic(data);
        break;
      case 'unsubscribe':
        unsubscribeTopic(data);
        break;
      case 'changeDepth':
        byFbuPublicWs.changeDepth(data.depth);
        break;
      default:
        // eslint-disable-next-line no-console
        console.error('method not support');
    }
    return null;
  });

  // NOTICE: webworkder postmessage to 主线程
  const sendMessageToMainThread = (topic, msg) => {
    self.postMessage({ topic, msg });
  };

  const handlerAllSymbolQuoteData = (topic, result) => {
    if (!Object.keys(result).length) return;
    const { data } = result;
    const allSymbolQuoteData = {};
    data.forEach((item) => {
      allSymbolQuoteData[item.symbol] = item;
    });
    sendMessageToMainThread(topic, allSymbolQuoteData);
  };

  // NOTICE: webworker 订阅 topic & 响应
  const subscribeTopic = ({ topic, symbol, marketType }) => {
    if (marketType) {
      byFbuPublicWs.subscribeTopicDirect(topic, marketType);
      switch (marketType) {
        case MarketTypes.MARKET_CANDLE:
          marketCandleSubscription =
            byFbuPublicWs.marketCandleSubject.subscribe((res) => {
              sendMessageToMainThread(
                MarketTypes.MARKET_CANDLE,
                res.data || []
              );
            });
          break;
        case MarketTypes.MARK_CANDLE:
          markCandleSubscription = byFbuPublicWs.markCandleAllSubject.subscribe(
            (res) => {
              // console.log("marketCandleSubscription:",res.data);
              sendMessageToMainThread(MarketTypes.MARK_CANDLE, res.data || []);
            }
          );
          break;
        default:
        // eslint-disable-next-line no-console
        //  console.log(`webwork => ${marketType} not support`);
      }
    } else {
      byFbuPublicWs.subscribeTopic({ topic, symbol });
      switch (topic) {
        case PublicWsTopics.IndexQuote20_H:
        case PublicWsTopics.IndexQuote200_H:
          recentTradeSubscription = byFbuPublicWs.recentTradeSubject.subscribe(
            (res) => {
              sendMessageToMainThread(INDEX_QUOTE_TYPE.RECENT_TRADE, res);
            }
          );
          orderBooktSubscription = byFbuPublicWs.orderBookSubject.subscribe(
            (res) => {
              sendMessageToMainThread(INDEX_QUOTE_TYPE.ORDER_BOOK, res);
            }
          );
          instrumentSubscription = byFbuPublicWs.instrumentSubject.subscribe(
            (res) => {
              // console.log("INSTRUMENT:",res);
              sendMessageToMainThread(INDEX_QUOTE_TYPE.INSTRUMENT, res);
            }
          );
          break;
        case ORDERBOOK_TYPE.RECENTLY_TRADE:
          recentTradeSubscription = byFbuPublicWs.recentTradeSubject.subscribe(
            (res) => {
              sendMessageToMainThread(INDEX_QUOTE_TYPE.RECENT_TRADE, res);
            }
          );
          break;
        case ORDERBOOK_TYPE.BOOK_20:
        case ORDERBOOK_TYPE.BOOK_25:
        case ORDERBOOK_TYPE.BOOK_80:
        case ORDERBOOK_TYPE.BOOK_200:
          orderBooktSubscription = byFbuPublicWs.orderBookSubject.subscribe(
            (res) => {
              sendMessageToMainThread(INDEX_QUOTE_TYPE.ORDER_BOOK, res);
            }
          );
          break;

        case PublicWsTopics.InstrumentInfo_H:
        case PublicWsTopics.InstrumentInfo_M:
          instrumentSingleSubscription =
            byFbuPublicWs.instrumentSubject.subscribe((res) => {
              sendMessageToMainThread(topic, res);
            });
          break;
        case PublicWsTopics.InstrumentInfoAll:
          instrumentInfoAllSubscription =
            byFbuPublicWs.allSymbolQuoteSubject.subscribe((res) => {
              handlerAllSymbolQuoteData(PublicWsTopics.InstrumentInfoAll, res);
            });
          break;
        case PublicWsTopics.PublicNotice:
          publicNoticeSubscription =
            byFbuPublicWs.publicNoticeSubject.subscribe((res) => {
              sendMessageToMainThread(PublicWsTopics.PublicNotice, res);
            });
          break;
        default:
          // eslint-disable-next-line no-console
          console.log(`webwork => ${topic} not support`);
      }
    }
  };

  const unsubscribeTopic = ({ topic, symbol, marketType }) => {
    if (marketType) {
      if (topic.includes('candle')) {
        marketCandleSubscription.unsubscribe();
      } else {
        markCandleSubscription.unsubscribe();
      }
      byFbuPublicWs.unsubscribeTopicDirect(topic, true);
    } else {
      switch (topic) {
        case PublicWsTopics.IndexQuote20_H:
        case PublicWsTopics.IndexQuote200_H:
          orderBooktSubscription.unsubscribe();
          instrumentSubscription.unsubscribe();
          recentTradeSubscription.unsubscribe();
          break;
        case ORDERBOOK_TYPE.RECENTLY_TRADE:
          recentTradeSubscription.unsubscribe();
          break;
        case ORDERBOOK_TYPE.BOOK_20:
        case ORDERBOOK_TYPE.BOOK_25:
        case ORDERBOOK_TYPE.BOOK_80:
        case ORDERBOOK_TYPE.BOOK_200:
          orderBooktSubscription.unsubscribe();
          break;
        case PublicWsTopics.InstrumentInfo_M:
        case PublicWsTopics.InstrumentInfo_H:
          instrumentSingleSubscription.unsubscribe();
          break;
        case PublicWsTopics.InstrumentInfoAll:
          instrumentInfoAllSubscription.unsubscribe();
          break;
        case PublicWsTopics.PublicNotice:
          publicNoticeSubscription.unsubscribe();
          break;
        default: {
          console.log(`webwork => unsubscribe ${topic} not support`);
        }
      }
      byFbuPublicWs.unsubscribeTopic({ topic, symbol });
    }
  };
}
