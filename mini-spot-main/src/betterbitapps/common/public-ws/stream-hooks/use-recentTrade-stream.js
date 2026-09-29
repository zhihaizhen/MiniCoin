import { useState, useEffect, useCallback } from 'react';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { getRecentTrades } from '@/services/recentTrade.service';
import { recentTradeStream } from '../streams/indexQuoteStream.stream';

const MAX_LIST_LEN = 100;

// 将原始成交字段 {v,p,q,t,m}（HTTP快照 与 WS推送 共用此格式）转换为展示字段，
// 并与已有列表合并去重（按交易唯一ID execId），保持 execTime 倒序，最多保留 MAX_LIST_LEN 条。
// HTTP快照和WS推送共用该函数，避免因两者到达顺序不同而互相覆盖丢失数据。
const mergeTrades = (rawItems = [], prevList = []) => {
  const mapped = rawItems.map((item) => {
    const { v, p, q, t, m } = item;
    return {
      execId: v,
      execPrice: p,
      execQty: q,
      execTime: t,
      side: m ? 'Buy' : 'Sell',
    };
  });

  const merged = [...mapped, ...prevList];
  const seen = new Set();
  const deduped = merged.filter((it) => {
    if (it.execId == null) return true;
    if (seen.has(it.execId)) return false;
    seen.add(it.execId);
    return true;
  });

  deduped.sort((a, b) => Number(b.execTime) - Number(a.execTime));
  return deduped.slice(0, MAX_LIST_LEN);
};

const useRecentTradeStream = () => {
  const { symbolAlias } = useCurSymbolConfig();
  const getInitalRTData = useCallback(() => ({
    loaded: false,
    list: [],
  }), []);
  const [recentTrade, setRecentTrade] = useState(getInitalRTData());

  useEffect(() => {
    if (!symbolAlias) return undefined;
    setRecentTrade(getInitalRTData());
    let cancelled = false;

    // 1. 先通过HTTP拉取一次快照
    getRecentTrades({ symbol: symbolAlias })
      .then((rawList) => {
        if (cancelled) return;
        setRecentTrade((prevData) => ({
          loaded: true,
          list: mergeTrades(rawList, prevData.list),
        }));
      })
      .catch(() => {
        // 快照拉取失败也要结束loading，列表可能为空
        if (!cancelled) {
          setRecentTrade((prevData) => ({ ...prevData, loaded: true }));
        }
      });

    // 2. 再由WS增量推送持续追加最新成交
    const subscription = recentTradeStream.subscribe((rtDetail) => {
      if (!rtDetail) return;
      const { data = [], symbol } = rtDetail;
      if (!symbol || symbol !== symbolAlias) {
        // 解决 unsubscribe BehaviorSubject 时断流，无法更新 last value，导致每次重新订阅时，拿到的都是旧值
        return;
      }

      setRecentTrade((prevData) => ({
        loaded: true,
        list: mergeTrades(data, prevData.list),
      }));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [symbolAlias]);

  return recentTrade;
};

export default useRecentTradeStream;
