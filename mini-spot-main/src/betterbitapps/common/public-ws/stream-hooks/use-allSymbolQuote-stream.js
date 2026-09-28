import { useGlobalState } from '@/store';
import BigNumber from 'bignumber.js';
import AllSymbolQuoteStream from 'common/public-ws/streams/allSymbolQuote.stream';
import { toThousandsNumber } from 'common/utils/utils';
import { useEffect, useState } from 'react';

// 跨组件挂载周期缓存：避免错过 WS 首次全量推送后，只拿到 BehaviorSubject 的“最后一次增量”
const allSymbolQuoteGlobalState = {
  current: {},
};

const parseSymbolAlias = (symbolAlias, wclist) => {
  if (!symbolAlias || !Array.isArray(wclist) || !wclist.length) return null;
  // 只按后缀匹配，并优先取最长 token，避免 token 子串互相影响
  const sorted = [...wclist].sort(
    (a, b) => (b?.length || 0) - (a?.length || 0),
  );
  for (let i = 0; i < sorted.length; i += 1) {
    const wc = sorted[i];
    if (wc && symbolAlias.endsWith(wc)) {
      const symbol = symbolAlias.slice(0, -wc.length);
      return { symbol, walletCoin: wc };
    }
  }
  return null;
};

const useAllSymbolQuoteStream = () => {
  const [globalState] = useGlobalState();
  const [allSymbolQuoteData, setAllSymbolQuoteData] = useState(
    allSymbolQuoteGlobalState.current,
  );
  const { allSpotTokenConfig = {} } = globalState;

  useEffect(() => {
    // 不要 allSpotTokenConfig 初始化才订阅，否则会错过 WS 首次全量推送
    const subscription = AllSymbolQuoteStream.subscribe((data) => {
      if (!data) return;
      const allQuoteData = {};

      Object.values(data).forEach((item) => {
        const {
          // sn: symbolAlias,
          s: symbolAlias,
          c: closePrice, // 收盘价
          h: highPrice24h,
          l: lowPrice24h,
          o: openPrice, // 开盘价
          v: volume24h, // 24小时成交量
          qv: turnover24h, // 24小时成交额
          m: changeRate24H, // 24小时涨跌
        } = item;
        if (!symbolAlias) return;

        const wclist = Object.keys(allSpotTokenConfig || {});

        // 用配置里的币种做后缀校验：配置有USDC则保留，配置没有则自动过滤掉ws多返回的USDC数据
        const isInvalidSymbol = !wclist.some((wc) => symbolAlias.endsWith(wc));
        if (isInvalidSymbol) return;
        const { symbol, walletCoin } =
          parseSymbolAlias(symbolAlias, wclist) || {};

        const symbolConfig =
          symbol && walletCoin
            ? allSpotTokenConfig?.[walletCoin]?.[symbol]
            : undefined;
        const { priceFraction, lotFraction, balanceFraction } =
          symbolConfig || {};
        // 精度兜底
        const safePriceFraction = Number.isFinite(priceFraction)
          ? priceFraction
          : 8;
        const safeLotFraction = Number.isFinite(lotFraction) ? lotFraction : 8;
        const safeBalanceFraction = Number.isFinite(balanceFraction)
          ? balanceFraction
          : 8;

        const changeRate24h = BigNumber(changeRate24H || 0)
          .multipliedBy(100)
          .toNumber();

        const formattedClosePrice = toThousandsNumber(
          closePrice,
          safePriceFraction,
        ); // 收盘价
        const formattedHighPrice24h = toThousandsNumber(
          highPrice24h || 0,
          safePriceFraction,
        );
        const formattedLowPrice24h = toThousandsNumber(
          lowPrice24h || 0,
          safePriceFraction,
        );
        const formattedOpenPrice = toThousandsNumber(
          openPrice || 0,
          safePriceFraction,
        );
        const formattedVolume24h = toThousandsNumber(
          volume24h || 0,
          safeLotFraction,
        );
        const formattedTurnover24h = toThousandsNumber(
          turnover24h || 0,
          safeBalanceFraction,
        );
        const formattedChangeRate24h = toThousandsNumber(changeRate24h);

        allQuoteData[symbolAlias] = {
          symbol,
          symbolAlias,
          walletCoin,
          // 原始数据，number类型
          closePrice,
          highPrice24h,
          lowPrice24h,
          openPrice,
          volume24h,
          turnover24h,
          changeRate24h,

          // 格式化后的价格,有千分位，字符串类型
          formattedClosePrice, // 收盘价
          formattedHighPrice24h,
          formattedLowPrice24h,
          formattedOpenPrice, // 开盘价
          formattedvolume24h: formattedVolume24h,
          formatteTurnover24h: formattedTurnover24h,
          formattedChangeRate24h,
        };
      });
      // 只更新此次推送中包含的symbol，如果某symbol此次推送中没有，则保留之前的状态
      allSymbolQuoteGlobalState.current = {
        ...allSymbolQuoteGlobalState.current,
        ...allQuoteData,
      };
      setAllSymbolQuoteData(allSymbolQuoteGlobalState.current);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [allSpotTokenConfig]);

  // 当 token 配置初始化/更新后，把缓存里已有的行情重新按正确精度格式化一次
  useEffect(() => {
    if (!allSpotTokenConfig || !Object.keys(allSpotTokenConfig).length) return;
    const wclist = Object.keys(allSpotTokenConfig);
    const next = { ...allSymbolQuoteGlobalState.current };
    Object.entries(next).forEach(([symbolAlias, q]) => {
      const { symbol, walletCoin } = parseSymbolAlias(symbolAlias, wclist);

      const symbolConfig = symbol
        ? allSpotTokenConfig?.[walletCoin]?.[symbol]
        : undefined;
      if (!symbolConfig) return;
      const { priceFraction, lotFraction, balanceFraction } =
        symbolConfig || {};
      next[symbolAlias] = {
        ...q,
        symbol,
        walletCoin,
        formattedClosePrice: toThousandsNumber(q.closePrice, priceFraction),
        formattedHighPrice24h: toThousandsNumber(
          q.highPrice24h || 0,
          priceFraction,
        ),
        formattedLowPrice24h: toThousandsNumber(
          q.lowPrice24h || 0,
          priceFraction,
        ),
        formattedOpenPrice: toThousandsNumber(q.openPrice || 0, priceFraction),
        formattedvolume24h: toThousandsNumber(q.volume24h || 0, lotFraction),
        formatteTurnover24h: toThousandsNumber(
          q.turnover24h || 0,
          balanceFraction,
        ),
      };
    });
    allSymbolQuoteGlobalState.current = next;
    setAllSymbolQuoteData(allSymbolQuoteGlobalState.current);
  }, [allSpotTokenConfig]);
  // console.log('step4，AllSymbolQuoteStream',allSymbolQuoteData);
  return allSymbolQuoteData;
};

export default useAllSymbolQuoteStream;
