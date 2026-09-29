/* eslint-disable no-param-reassign */
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { useGlobalState } from '@/store';
import BigNumber from 'bignumber.js';
import { toNumberZero, toThousandsNumber } from 'common/utils/utils';
import { useCallback, useEffect, useState } from 'react';
import { instrumentStream } from '../streams/indexQuoteStream.stream';

const instrumentGlobalState = {
  current: {},
};

const useCurSymbolQuoteStream = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const { allSpotTokenConfig = {}, walletCoin, symbolAlias } = globalState;
  const { priceFraction, lotFraction } = useCurSymbolConfig();
  const [instrument, setInstrument] = useState(instrumentGlobalState.current);

  const handleInstrumentParam = useCallback(
    (instrumentParam) => {
      const {
        // sn: symbolAlias, // BTCUSDT
        s: symbolAlias, // BTCUSDT
        c: closePrice, // 收盘价
        h: highPrice24h,
        l: lowPrice24h,
        o: openPrice, // 开盘价
        v: volume24h, // 24小时成交量 btc
        qv: turnover24h, // 24小时成交额 usdt
        m: changeRate24H, // 24小时涨跌
      } = instrumentParam?.data?.[0] ?? {};
      const symbol = symbolAlias?.split(walletCoin)[0];
      const symbolConfig = allSpotTokenConfig?.[walletCoin]?.[symbol];
      const { priceFraction, lotFraction } = symbolConfig || {};

      const changeRate24h = BigNumber(changeRate24H)
        .multipliedBy(100)
        .toNumber();

      const formattedClosePrice = toThousandsNumber(closePrice, priceFraction); // 收盘价
      const formattedHighPrice24h = toThousandsNumber(
        highPrice24h,
        priceFraction,
      );
      const formattedLowPrice24h = toThousandsNumber(
        lowPrice24h,
        priceFraction,
      );
      const formattedOpenPrice = toThousandsNumber(openPrice, priceFraction);
      const formattedVolume24h = toThousandsNumber(volume24h, 2); // 现货小数位固定
      const formattedTurnover24h = toThousandsNumber(turnover24h, 2);
      const formattedChangeRate24h = toThousandsNumber(changeRate24h);

      const newState = {
        symbol,
        symbolAlias,
        // 原始数据，number类型
        closePrice,
        highPrice24h,
        lowPrice24h,
        openPrice,
        volume24h,
        turnover24h,
        changeRate24h,
        lastPriceNumber: closePrice,
        // 格式化后的价格,有千分位，字符串类型
        formattedClosePrice, // 收盘价
        formattedHighPrice24h,
        formattedLowPrice24h,
        formattedOpenPrice, // 开盘价

        formattedVolume24h,
        formattedTurnover24h,
        formattedChangeRate24h,
      };
      return newState;
    },
    [walletCoin],
  );

  const setInstrumentWrapper = useCallback((newState) => {
    if (newState.symbol === instrumentGlobalState.current.symbol) {
      instrumentGlobalState.current = {
        ...instrumentGlobalState.current,
        ...newState,
      };
    } else {
      instrumentGlobalState.current = { ...newState };
    }

    setInstrument(instrumentGlobalState.current);
  }, []);

  useEffect(() => {
    const subscriber = instrumentStream.subscribe((instrumentParam) => {
      let newState = {};
      // console.log("instrumentParam.subscribe:",instrumentParam);
      // initKline: K线图时长、种类切换，需要 init lastPrice和markPrice
      if (instrumentParam && instrumentParam.initKline) {
        newState = instrumentParam;
      } else {
        if (instrumentParam && instrumentParam.symbol !== symbolAlias) {
          // 解决 unsubscribe BehaviorSubject 时断流，无法更新 last value，导致每次重新订阅时，拿到的都是旧值
          instrumentParam = {};
        }

        newState = handleInstrumentParam(
          instrumentParam,
          priceFraction,
          lotFraction,
        );
      }
      setInstrumentWrapper(newState);
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [priceFraction, lotFraction, symbolAlias]);
  return instrument;
};

export default useCurSymbolQuoteStream;
