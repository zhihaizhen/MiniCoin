import { Env } from '@region-lib/env';
import MiniPublicWs from './PublicWebSocket';
import { WS_TYPE } from './constants';
import { spotAllSymbolQuoteStream } from '../publicWS/allSymbolObservables';

let miniPublicWs = null;
let tickersBatchCache = null; // { bt, t, full, batches: {} }
let tickersFullData = {}; // accumulated symbol -> ticker map

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

const processTickersUpdate = (dataArr, timestamp, isFull) => {
  const parsed = {};
  dataArr.forEach((item) => {
    parsed[item[0]] = parseTickerItem(item, timestamp);
  });
  tickersFullData = isFull ? parsed : { ...tickersFullData, ...parsed };
  if (Object.keys(tickersFullData).length) {
    spotAllSymbolQuoteStream.next(Object.values(tickersFullData));
  }
};

const handleTickersFrame = (result) => {
  const { full, t, bi, bt, data } = result || {};
  if (!Array.isArray(data) || !data.length) return;

  if (bt > 1) {
    if (!tickersBatchCache || (full && bi === 1)) {
      tickersBatchCache = { bt, t, full, batches: {} };
    }
    tickersBatchCache.batches[bi] = data;

    if (Object.keys(tickersBatchCache.batches).length < bt) return;

    const merged = [];
    for (let i = 1; i <= bt; i++) {
      if (tickersBatchCache.batches[i]) merged.push(...tickersBatchCache.batches[i]);
    }
    const { full: mergedFull, t: mergedT } = tickersBatchCache;
    tickersBatchCache = null;
    processTickersUpdate(merged, mergedT, mergedFull);
  } else {
    processTickersUpdate(data, t, full);
  }
};

// 现货tickers行情：主线程直连，不走webworker，只订阅tickers这一个topic
export const initSpotTickersWs = () => {
  if (typeof window === 'undefined') return;

  if (!miniPublicWs) {
    miniPublicWs = new MiniPublicWs({ host: Env.WS_HOST, showLog: false });
    miniPublicWs.allSymbolQuoteNewSubject.subscribe(handleTickersFrame);
  }

  miniPublicWs.subscribeTopic({ topic: WS_TYPE.ALL_SYMBOL_QUOTE_NEW });
};
