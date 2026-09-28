// @ts-nocheck
import { Env } from '@region-lib/env';
import { futureSymbolQuoteStream } from './allSymbolObservables';

const { WS_HOST } = Env;
const TOPIC = 'tickers.all.new';
const PATH = '/realtime_public?v=9';
const PING_INTERVAL = 10000;

let ws = null;
let pingTimer = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let tickersBatchCache = null; // { bt, full, batches: {} }
let tickersFullData = {}; // symbol -> decoded item, persists across pushes

// [Symbol, LastPrice, Price24hPcntE6, HighPrice24h, LowPrice24h, MarkPrice, Turnover24hE8, Volumes24h]
const decodeItem = ([
  symbol,
  lastPrice,
  price24hPcntE6,
  highPrice24h,
  lowPrice24h,
  markPrice,
  turnover24h,
  volume24h
]) => ({
  s: symbol,
  p: lastPrice,
  pP: price24hPcntE6,
  h: highPrice24h,
  l: lowPrice24h,
  mp: markPrice,
  to: turnover24h,
  v: volume24h
});

// full: 是否全量推送。全量时用当批数据整体替换累积表，增量时合并进已有累积表，
// 每次都把累积表的完整内容下发，保证下游拿到的始终是全量symbol集合
const processUpdate = (dataArr, isFull) => {
  const parsed = {};
  dataArr.forEach((item) => {
    const decoded = decodeItem(item);
    parsed[decoded.s] = decoded;
  });
  tickersFullData = isFull ? parsed : { ...tickersFullData, ...parsed };
  if (Object.keys(tickersFullData).length) {
    futureSymbolQuoteStream.next(Object.values(tickersFullData));
  }
};

// tickers.all.new按bt(总批次)/bi(当前批次,从1开始)分批推送，凑齐一整轮后再合并进累积表
const handleFrame = (data, btRaw, biRaw, fullRaw) => {
  if (!Array.isArray(data) || !data.length) return;

  const bt = Number(btRaw);
  const bi = Number(biRaw);
  const full = !!fullRaw;

  if (bt > 1) {
    if (!tickersBatchCache || (full && bi === 1)) {
      tickersBatchCache = { bt, full, batches: {} };
    }
    tickersBatchCache.batches[bi] = data;

    if (Object.keys(tickersBatchCache.batches).length < tickersBatchCache.bt) return;

    const merged = [];
    for (let i = 1; i <= tickersBatchCache.bt; i++) {
      if (tickersBatchCache.batches[i]) merged.push(...tickersBatchCache.batches[i]);
    }
    const { full: mergedFull } = tickersBatchCache;
    tickersBatchCache = null;
    processUpdate(merged, mergedFull);
  } else {
    processUpdate(data, full);
  }
};

const stopPing = () => {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
};

const startPing = () => {
  stopPing();
  pingTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ op: 'ping', args: [Date.now()] }));
    }
  }, PING_INTERVAL);
};

const subscribe = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ op: 'subscribe', args: [TOPIC] }));
  }
};

const handleMessage = (data) => {
  // 服务端心跳（两种历史格式都兼容，与by-ws保持一致）
  if (data.ping) {
    ws.send(JSON.stringify({ pong: data.ping }));
    return;
  }
  if (data.op === 'ping') {
    const { op, ...rest } = data;
    ws.send(JSON.stringify({ op: 'pong', ...rest }));
    return;
  }
  if (data.ret_msg === 'pong' || data.op === 'pong') return;

  if (data.topic === TOPIC) {
    handleFrame(data.data, data.bt, data.bi, data.full);
  }
};

const connect = () => {
  const url = `${WS_HOST}${PATH}${PATH.includes('?') ? '&' : '?'}timestamp=${Date.now()}`;
  ws = new WebSocket(url);

  ws.onopen = () => {
    reconnectAttempts = 0;
    startPing();
    subscribe();
  };

  ws.onmessage = (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    if (Array.isArray(payload)) {
      payload.forEach(handleMessage);
    } else {
      handleMessage(payload);
    }
  };

  ws.onclose = () => {
    stopPing();
    reconnectAttempts += 1;
    const delay = Math.min(1000 * reconnectAttempts, 5000);
    reconnectTimer = setTimeout(connect, delay);
  };

  ws.onerror = () => {
    // onclose will follow and trigger reconnect
  };
};

// 合约tickers.all.new：主线程直连raw WebSocket（by-ws的onData只透传{type,data,timestampE6}，
// 会丢弃bt/bi分批字段，因此改为不经过by-ws，自行解析完整帧）
export const initFuturesTickersWs = async () => {
  if (typeof window === 'undefined' || ws) return;
  connect();
};
