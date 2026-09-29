import { Subject } from 'rxjs';
import BigNumber from 'bignumber.js';
import {
  MarketTypes,
  intervalMap,
  reverseIntervalMap,
  baseConfig,
  WS_PATHNAME_ZM,
  DEFAULT_ID_FACTOR,
  WS_TYPE,
} from './constants';
import {
  formatSymbol,
  handleInstrument,
  handleRT,
  handleOBItem,
  handleOB,
  getTotalCalculatedAndSortedList,
  toNumber,
} from './utils';

export default class MiniPublicWs {
  constructor({ host, showLog, pathName }) {
    this.host = host;
    this.pathName = pathName || WS_PATHNAME_ZM;
    this.showLog = showLog;
    this.ws = null;
    this.pingTimer = null;
    this.reconnectTimer = null;
    this.subscriptions = new Map(); // id -> sub details
    this.manualClose = false;

    this.websocketEventSubject = new Subject();
    this.marketCandleSubject = new Subject();
    this.markCandleAllSubject = new Subject();
    this.recentTradeSubject = new Subject();
    this.orderBookSubject = new Subject();
    this.depthSubject = new Subject();
    this.instrumentSubject = new Subject();
    this.allSymbolQuoteSubject = new Subject();
    this.allSymbolQuoteNewSubject = new Subject();

    this.orderBookStates = new Map(); // symbol -> state
    this.recentTradeStates = new Map(); // symbol -> state
    this.symbolDepthMap = new Map(); // symbol -> depth info

    this.connect();
  }

  connect() {
    if (!this.host) {
      if (this.showLog)
        console.warn('[MiniPublicWs] connect skipped: no host provided');
      return;
    }
    if (this.ws) {
      this.cleanup();
    }
    this.manualClose = false;

    let host = (this.host || '').trim();
    if (host.endsWith('/')) {
      host = host.slice(0, -1);
    }

    if (!host.includes('://')) {
      host = `wss://${host}`;
    } else if (host.startsWith('ws:')) {
      host = host.replace(/^ws:/, 'wss:');
    }

    const url = `${host}${this.pathName}${
      this.pathName.includes('?') ? '&' : '?'
    }t=${Date.now()}`;

    if (this.showLog) console.log('[MiniPublicWs] final url:', url);
    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      if (this.showLog)
        console.error('[MiniPublicWs] WebSocket creation failed', e);
      this.reconnect();
      return;
    }

    this.ws.onopen = () => {
      if (this.showLog) console.log('[MiniPublicWs] connected');
      this.websocketEventSubject.next({ type: 'connected', data: {} });
      this.startPing();
      this.resubscribe();
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('[MiniPublicWs] parse error', e);
      }
    };

    this.ws.onclose = (event) => {
      if (this.showLog)
        console.log('[MiniPublicWs] closed', event.code, event.reason);
      this.websocketEventSubject.next({
        type: 'close',
        data: { code: event.code, reason: event.reason },
      });
      this.stopPing();
      if (!this.manualClose) {
        this.reconnect();
      }
    };

    this.ws.onerror = (error) => {
      if (this.showLog) {
        const errorInfo = {
          message: error.message || 'Unknown WebSocket error',
          type: error.type,
          readyState: this.ws ? this.ws.readyState : 'unknown',
        };
        console.error('[MiniPublicWs] error details:', errorInfo);
      }
      this.websocketEventSubject.next({ type: 'error', data: {} });
    };
  }

  reconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;

    this.websocketEventSubject.next({
      type: 'reconnect',
      data: { attempt: this.reconnectAttempts },
    });

    const delay = Math.min(1000 * this.reconnectAttempts, 5000);

    if (this.showLog)
      console.log(
        `[MiniPublicWs] reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
      );
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (
        this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN
      ) {
        this.ws.close();
      }
      this.ws = null;
    }
    this.stopPing();
  }

  startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ op: 'ping', args: [Date.now()] });
      }
    }, 5000);
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      if (this.showLog && data.op !== 'ping') {
        console.log('[MiniPublicWs] send:', data);
      }
    }
  }

  resubscribe() {
    this.subscriptions.forEach((sub) => {
      this.send(sub);
    });
  }

  handleMessage(data) {
    if (data.op === 'pong') return;

    if (
      this.showLog &&
      data.topic !== 'slowBroker' &&
      data.topic !== 'tickers'
    ) {
      console.log('[MiniPublicWs] receive:', data);
    }

    const { topic, symbol: msgSymbol, data: msgData } = data;
    let symbol =
      msgSymbol ||
      (Array.isArray(msgData)
        ? msgData[0]?.s || msgData[0]?.symbol
        : msgData?.s || msgData?.symbol);

    if (symbol && typeof symbol === 'string' && symbol.startsWith('301.')) {
      symbol = symbol.slice(4);
    }

    if (!topic) return;

    if (topic === WS_TYPE.ALL_SYMBOL_QUOTE) {
      // const transformed = this.handleAllSymbol(data);
      // this.allSymbolQuoteSubject.next(transformed);
      this.allSymbolQuoteSubject.next(data);
      // }  else if (topic === 'realtimes' || topic === 'trade') {
      //   const items = Array.isArray(msgData) ? msgData : [msgData];
      //   items.forEach((item) => {
      //     let itemSymbol = item.s || item.symbol || symbol;
      //     if (
      //       itemSymbol &&
      //       typeof itemSymbol === 'string' &&
      //       itemSymbol.startsWith('301.')
      //     ) {
      //       itemSymbol = itemSymbol.slice(4);
      //     }
      //     if (!itemSymbol) return;

      //     if (topic === 'realtimes') {
      //       const instrument = this.handleSingleSymbol(itemSymbol, {
      //         data: item,
      //         type: 'delta',
      //       });
      //       this.instrumentSubject.next(instrument);
      //     }

      //     if (topic === 'trade' || (item.d && item.d.length > 0)) {
      //       const trades = this.handleRecentlyData(itemSymbol, {
      //         data: item,
      //         type: 'delta',
      //         d: item.d || (Array.isArray(item) ? item : undefined),
      //       });
      //       this.recentTradeSubject.next(trades);
      //     }
      //   });
      //   this.allSymbolQuoteSubject.next(data);
    } else if (topic === WS_TYPE.ALL_SYMBOL_QUOTE_NEW) {
      this.allSymbolQuoteNewSubject.next(data);
    } else if (topic === WS_TYPE.RECENTLY_TRADE) {
      this.recentTradeSubject.next(data);
    } else if (topic === WS_TYPE.SINGLE_SYMBOL_QUOTE) {
      this.instrumentSubject.next(data);
    } else if (topic === WS_TYPE.ORDER_BOOK) {
      // if (!symbol) return;
      // const depthData = Array.isArray(msgData) ? msgData[0] : msgData;
      // const orderBook = this.handleOrderbookData(
      //   symbol,
      //   { ...data, type: 'snapshot', data: depthData },
      //   'orderBook',
      // );
      // this.orderBookSubject.next(orderBook);
      this.orderBookSubject.next(data);
    } else if (topic === WS_TYPE.DEPTH) {
      // if (!symbol) return;
      // const depthData = Array.isArray(msgData) ? msgData[0] : msgData;
      // const orderBook = this.handleOrderbookData(
      //   symbol,
      //   { ...data, data: depthData },
      //   'depth',
      // );
      // this.depthSubject.next(orderBook);
      this.depthSubject.next(data);
    } else if (
      topic === WS_TYPE.KLINE ||
      (data.id && data.id.startsWith('kline_')) ||
      (topic && topic.startsWith('kline_'))
    ) {
      const klineId = data.id || topic;
      const actualKlineType =
        data.params?.klineType ||
        (klineId.match(/(\d+[mhdWM])$/) || [])[0] ||
        '';
      const period = intervalMap[actualKlineType] || actualKlineType;

      const normalizedData = (
        Array.isArray(msgData) ? msgData : data.data || []
      ).map((item) => ({
        start: item.t ? Math.floor(item.t / 1000) : item.start,
        open: item.o || item.open,
        high: item.h || item.high,
        low: item.l || item.low,
        close: item.c || item.close,
        volume: item.v || item.volume,
        turnover: item.turnover || '0',
        period: period || item.period,
        confirm: data.f || false,
        symbol: symbol,
      }));

      if (klineId.startsWith('mark_kline_')) {
        this.markCandleAllSubject.next(normalizedData);
      } else {
        this.marketCandleSubject.next(normalizedData);
      }
    }
  }

  subscribeTopic({ topic, symbol, obDepthInfo }) {
    const formattedSymbol = formatSymbol(symbol);
    let id = `${topic}.${symbol}`;
    let newTopic = topic;
    let params = { realtimeInterval: '24h', binary: false };
    let limit = undefined;
    if (topic === WS_TYPE.SINGLE_SYMBOL_QUOTE) {
      id = 'realtimes';
    } else if (topic === WS_TYPE.ORDER_BOOK) {
      // id为0表示布长为1,对应的dumpScale为-1，所以用dumpScale判断
      // console.log('obDepthInfo', obDepthInfo);
      if (!obDepthInfo.dumpScale) {
        return;
      }
      id = `${formattedSymbol}${obDepthInfo?.id}`;
      limit = 22;
      params.dumpScale = obDepthInfo?.dumpScale;
    } else if (topic === WS_TYPE.DEPTH) {
      id = `depth${formattedSymbol}`;
      limit = 100;
    } else if (topic === WS_TYPE.ALL_SYMBOL_QUOTE) {
      newTopic = 'slowBroker';
      id = 'broker';
      params.org = 9001;
    } else if (topic === WS_TYPE.ALL_SYMBOL_QUOTE_NEW) {
      newTopic = 'tickers';
      id = 'broker';
    }

    if (newTopic) {
      const subMsg = {
        id,
        topic: newTopic,
        event: 'sub',
        symbol: formattedSymbol,
        params,
      };
      if (limit !== undefined) subMsg.limit = limit;
      if (newTopic === 'slowBroker') {
        delete subMsg.symbol;
      }
      if (newTopic === 'tickers') {
        delete subMsg.symbol;
      }

      const existing = this.subscriptions.get(id);
      if (existing && JSON.stringify(existing) === JSON.stringify(subMsg)) {
        return;
      }

      this.subscriptions.set(id, subMsg);
      this.send(subMsg);
    }
  }

  subscribeTopicDirect(params, marketTypeOverride) {
    const {
      topic,
      marketType: mt,
      symbol,
      resolution,
    } = typeof params === 'object'
      ? params
      : { topic: params, marketType: marketTypeOverride };
    const marketType = mt || marketTypeOverride;

    if (
      marketType === MarketTypes.MARKET_CANDLE ||
      marketType === MarketTypes.MARK_CANDLE
    ) {
      let klineType, formattedSymbol, id;

      if (topic && topic.includes('.')) {
        const parts = topic.split('.');
        klineType = parts[1] || '1m';
        const rawSymbol = parts[2] || '';
        formattedSymbol = formatSymbol(rawSymbol);
        id = `kline_${formattedSymbol.replace('.', '')}${klineType}`;
      } else {
        klineType = intervalMap[resolution] || resolution || '1m';
        formattedSymbol = formatSymbol(symbol);
        id =
          topic && topic.startsWith('kline_')
            ? topic
            : `kline_${formattedSymbol.replace('.', '')}${klineType}`;
      }

      const subMsg = {
        id,
        topic: `kline_${klineType}`,
        event: 'sub',
        symbol: formattedSymbol,
        params: {
          binary: false,
          klineType,
          realtimeInterval: '24h',
          limit: 1500,
        },
      };

      const existing = this.subscriptions.get(id);
      if (existing && JSON.stringify(existing) === JSON.stringify(subMsg)) {
        return;
      }
      this.subscriptions.set(id, subMsg);
      this.send(subMsg);
    }
  }

  unsubscribeTopic({ topic, symbol, obDepthInfo = {} }) {
    const formattedSymbol = formatSymbol(symbol);
    let id = `${topic}.${symbol}`;

    if (topic === WS_TYPE.SINGLE_SYMBOL_QUOTE) {
      id = 'realtimes';
    } else if (topic === WS_TYPE.ORDER_BOOK) {
      id = `${formattedSymbol}${obDepthInfo?.id}`;
    } else if (topic === WS_TYPE.DEPTH) {
      id = `depth${formattedSymbol}`;
    } else if (topic === WS_TYPE.ALL_SYMBOL_QUOTE) {
      id = 'broker';
    } else if (topic === WS_TYPE.ALL_SYMBOL_QUOTE_NEW) {
      id = 'broker';
    }

    const sub = this.subscriptions.get(id);
    if (sub) {
      const cancelMsg = { ...sub, event: 'cancel' };
      this.send(cancelMsg);
      this.subscriptions.delete(id);
    }
  }

  unsubscribeTopicDirect(topic) {
    let id;
    if (topic && topic.includes('.')) {
      const parts = topic.split('.');
      const klineType = parts[1] || '1m';
      const symbol = parts[2] || '';
      const formattedSymbol = formatSymbol(symbol);
      id = `kline_${formattedSymbol.replace('.', '')}${klineType}`;
    } else {
      id = topic;
    }

    const sub = this.subscriptions.get(id);
    if (sub) {
      const cancelMsg = { ...sub, event: 'cancel' };
      this.send(cancelMsg);
      this.subscriptions.delete(id);
    }
  }

  changeUrl(host) {
    if (
      this.host === host &&
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.host = host;
    this.connect();
  }

  // changeDepth(symbolDepth) {
  //   const { symbolMeta } = symbolDepth || {};
  //   const symbol = symbolMeta?.symbol;
  //   if (symbol) {
  //     this.symbolDepthMap.set(symbol, symbolDepth);
  //     const state = this.orderBookUpdateDepthFn(symbol);
  //     if (state) {
  //       this.orderBookSubject.next(state);
  //     }
  //   }
  // }

  // handleAllSymbol(originalMessage) {
  //   let result = [];
  //   const { data } = originalMessage;
  //   if (Array.isArray(data)) {
  //     result = data.map((item) => handleInstrument(item));
  //   }
  //   return { ...originalMessage, data: result };
  // }

  // handleSingleSymbol(symbol, originalMessage) {
  //   const { ts, timestampE6, data } = originalMessage;
  //   // Use the nested data object content if present
  //   const tradeData = data || originalMessage;
  //   const result = { ...tradeData, ts: ts || timestampE6 || Date.now() };
  //   return handleInstrument(result);
  // }

  // handleRecentlyData(symbol, result) {
  //   const { type, data, d } = result;
  //   let state = this.recentTradeStates.get(symbol) || {
  //     list: [],
  //     loaded: false,
  //   };
  //   const tradesArr = d || (data && data.d);

  //   if (type === 'snapshot' || type === 'reset') {
  //     if (tradesArr && tradesArr.length > 0) {
  //       state = { list: handleRT(tradesArr, symbol), loaded: true };
  //     }
  //   } else {
  //     if (tradesArr && tradesArr.length > 0) {
  //       const handledRecentTrade = handleRT(tradesArr, symbol);
  //       const oldLen = state.list.length;
  //       if (
  //         oldLen === 0 ||
  //         (oldLen > 0 &&
  //           Date.parse(
  //             handledRecentTrade[handledRecentTrade.length - 1].execTime,
  //           ) >= Date.parse(state.list[0].execTime))
  //       ) {
  //         state.list = handledRecentTrade.reverse().concat(state.list);
  //       }
  //       if (state.list.length > 100) {
  //         state.list = state.list.slice(0, 100);
  //       }
  //       state.loaded = true;
  //     }
  //   }
  //   this.recentTradeStates.set(symbol, state);
  //   return state;
  // }

  // orderBookUpdateDepthFn(symbol) {
  //   const state = this.orderBookStates.get(symbol);
  //   if (!state) return null;

  //   const symbolDepth = this.symbolDepthMap.get(symbol);
  //   const { depth, symbolMeta } = symbolDepth || {};
  //   const isDefault = !!symbolMeta?.isDefault;

  //   if (!isDefault && depth) {
  //     // Depth grouping logic omitted
  //   }
  //   return state;
  // }

  // handleOrderbookData(symbol, result, type) {
  //   const { type: updateType, data } = result;
  //   const priceScale = this.getPriceScale(symbol);
  //   const limit = type === 'orderBook' ? 25 : 100;

  //   let currentState = this.orderBookStates.get(symbol) || {
  //     loaded: false,
  //     Sell: [],
  //     Buy: [],
  //     ask1Id: 0,
  //     bid1Id: 0,
  //     ask1Price: 0,
  //     bid1Price: 0,
  //     depthGroupedBuyList: [],
  //     depthGroupedSellList: [],
  //   };

  //   if (
  //     updateType === 'snapshot' ||
  //     updateType === 'reset' ||
  //     !currentState.loaded
  //   ) {
  //     let [buyList, sellList] = handleOB(data, priceScale, symbol);
  //     const [sortedBuy, sortedSell] = getTotalCalculatedAndSortedList(
  //       buyList,
  //       sellList,
  //       0,
  //       0,
  //       limit,
  //     );
  //     currentState = {
  //       ...currentState,
  //       loaded: true,
  //       Buy: sortedBuy,
  //       Sell: sortedSell,
  //     };
  //   } else {
  //     let [buyList, sellList] = handleOB(data, priceScale, symbol);

  //     buyList.forEach((newItem) => {
  //       const idx = currentState.Buy.findIndex((item) => item.Id === newItem.Id);
  //       if (idx === -1) {
  //         if (newItem.size > 0) currentState.Buy.push(newItem);
  //       } else if (newItem.size === 0) {
  //         currentState.Buy.splice(idx, 1);
  //       } else {
  //         currentState.Buy[idx] = newItem;
  //       }
  //     });

  //     sellList.forEach((newItem) => {
  //       const idx = currentState.Sell.findIndex(
  //         (item) => item.Id === newItem.Id,
  //       );
  //       if (idx === -1) {
  //         if (newItem.size > 0) currentState.Sell.push(newItem);
  //       } else if (newItem.size === 0) {
  //         currentState.Sell.splice(idx, 1);
  //       } else {
  //         currentState.Sell[idx] = newItem;
  //       }
  //     });

  //     const [sortedBuy, sortedSell] = getTotalCalculatedAndSortedList(
  //       currentState.Buy,
  //       currentState.Sell,
  //       currentState.bid1Id,
  //       currentState.ask1Id,
  //       limit,
  //     );

  //     currentState.Buy = sortedBuy;
  //     currentState.Sell = sortedSell;
  //   }

  //   if (data.b1) {
  //     currentState.bid1Price = Number(data.b1);
  //     currentState.bid1Id = new BigNumber(data.b1).times(priceScale).toNumber();
  //   } else if (currentState.Buy.length > 0) {
  //     currentState.bid1Price = currentState.Buy[0].price;
  //     currentState.bid1Id = currentState.Buy[0].Id;
  //   }

  //   if (data.a1) {
  //     currentState.ask1Price = Number(data.a1);
  //     currentState.ask1Id = new BigNumber(data.a1).times(priceScale).toNumber();
  //   } else if (currentState.Sell.length > 0) {
  //     currentState.ask1Price =
  //       currentState.Sell[currentState.Sell.length - 1].price;
  //     currentState.ask1Id = currentState.Sell[currentState.Sell.length - 1].Id;
  //   }

  //   this.orderBookStates.set(symbol, currentState);
  //   return currentState;
  // }
}
