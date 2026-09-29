/* eslint-disable no-param-reassign */
import { useSymbolConfig } from '../../../store-hooks/use-symbol-config';
import { useCallback, useEffect, useState } from 'react';
import { intercept, toNumber, toThousands } from '@unified/helpers';
import { TICK_DIRECTION } from '../../packages-biz/by-global-settings';
import { instrumentStream } from '../streams/indexQuoteStream.stream';

const instrumentGlobalState = {
  current: {}
};

const useInstrumentStore = () => {
  const { curSymbolConfig } = useSymbolConfig();
  const { priceFraction, lotFraction, symbol } = curSymbolConfig;
  const [instrument, setInstrument] = useState(instrumentGlobalState.current);
  const handleInstrumentParam = useCallback(
    (instrumentParam, priceFraction, lotFraction) => {
      const {
        symbol,
        lastPrice,
        markPrice,
        indexPrice,
        lastTickDirection,
        highPrice24h,
        lowPrice24h,
        volume24h,
        turnover24h,
        openInterest,
        price24hPcntE6,
        prevPrice24h,
        fundingRateE6,
        nextFundingTime,
        predictedFundingRateE6,
        timestampE6,
        fundingRateInterval = 8,
        delistingStatus = '0',
        timeToSettle,
        settleTimeE9,
        fairBasisE8,
        fairBasisRateE8,
        basisInYearE8,
        expectPrice,
        fundingRateGraySymbol = '0' // 默认是'0', 如果是 '1' 表示命中了资金费率实时收取的灰度币种.
      } = instrumentParam ?? {};
      // console.log("instrumentParam.handler:",instrumentParam);

      const lastPriceNumber = toNumber(intercept(lastPrice, priceFraction));
      const markPriceNumber = toNumber(intercept(markPrice, priceFraction));
      const indexPriceNumber = toNumber(intercept(indexPrice, priceFraction));
      const highPrice24hNumber = toNumber(
        intercept(highPrice24h, priceFraction)
      );
      const lowPrice24hNumber = toNumber(intercept(lowPrice24h, priceFraction));

      const volume24hNumber = volume24h / 1;
      const turnover24hNumber = turnover24h / 1;
      const formattedTurnover24h = toThousands(turnover24hNumber, 2);
      const openInterestNumber = openInterest / 1;

      const formattedLastPrice = toThousands(lastPriceNumber, priceFraction);
      const formattedMarkPrice = toThousands(markPriceNumber, priceFraction);
      const formattedIndexPrice = toThousands(indexPriceNumber, priceFraction);

      const formattedHighPrice24h = toThousands(
        highPrice24hNumber,
        priceFraction
      );
      const formattedLowPrice24h = toThousands(
        lowPrice24hNumber,
        priceFraction
      );
      const formattedOpenInterest = toThousands(
        openInterestNumber,
        lotFraction
      );

      const isLastPricePlus =
        TICK_DIRECTION.PLUS === lastTickDirection ||
        TICK_DIRECTION.ZERO_PLUS === lastTickDirection;

      const isLastPriceMinus =
        TICK_DIRECTION.MINUS === lastTickDirection ||
        TICK_DIRECTION.ZERO_MINUS === lastTickDirection;

      //  console.log('instrumentParam.price24hPcntE6:',price24hPcntE6);
      //  console.log('instrumentParam:',instrumentParam);

      const changeRate24H = intercept(price24hPcntE6 / 1e4, 2);

      const prevPrice24hNumber = toNumber(
        intercept(prevPrice24h, priceFraction)
      );
      const changeTurnover24H = intercept(
        lastPriceNumber - prevPrice24hNumber,
        priceFraction
      );

      const fundingRate = fundingRateE6 / 1e4;
      const fundingRateString = `${intercept(fundingRate, 4)}%`;
      const predictedFundingRate = predictedFundingRateE6 / 1e4;
      const predictFundingRateString = `${intercept(predictedFundingRate, 4)}%`;

      const currentLocalTime = parseInt(new Date().getTime() / 1e3, 10);
      const currentServiceTime = timestampE6
        ? parseInt(timestampE6 / 1e6, 10)
        : currentLocalTime;
      const formattedNextFundingTime = nextFundingTime
        ? parseInt(new Date(nextFundingTime).getTime() / 1e3, 10)
        : currentLocalTime;
      let restFundingTime = formattedNextFundingTime - currentServiceTime;
      if (restFundingTime < 0) {
        restFundingTime = 0;
      }

      const formattedVolume24h = toThousands(volume24hNumber, lotFraction);
      const fairBasis = toThousands(fairBasisE8 / 1e8, 2);
      const settleTime = settleTimeE9 ? settleTimeE9 / 1e6 : 0;
      const settleYear = settleTimeE9
        ? new Date(settleTimeE9 / 1e6).getUTCFullYear()
        : undefined;
      const settleMonth = settleTimeE9
        ? new Date(settleTimeE9 / 1e6).getUTCMonth() + 1
        : undefined;

      const futuresExpectPrice = toNumber(intercept(expectPrice));

      const formattedFuturesExpectPrice = toThousands(
        futuresExpectPrice,
        priceFraction
      );

      const newState = {
        symbol,
        lastPriceNumber,
        markPriceNumber,
        indexPriceNumber,
        formattedLastPrice,
        formattedMarkPrice,
        formattedIndexPrice,
        lastPrice: lastPriceNumber,
        klineLastPrice: lastPriceNumber,
        isLastPricePlus,
        isLastPriceMinus,
        markPrice: markPriceNumber,
        klineMarkPrice: markPriceNumber,
        indexPrice: indexPriceNumber,
        highPrice24h: highPrice24hNumber,
        lowPrice24h: lowPrice24hNumber,
        formattedHighPrice24h,
        formattedLowPrice24h,
        volume24h: formattedVolume24h,
        turnover24h: formattedTurnover24h,
        openInterest: formattedOpenInterest,
        settleTime,
        changeRate24H,
        changeTurnover24H,
        timeToSettle,
        futuresExpectPrice,
        formattedFuturesExpectPrice,
        predictFundingRateString,
        fundingRateString,
        nextFundingTime,
        restFundingTime,
        fundingRateInterval,
        delistingStatus,
        fairBasis,
        settleYear,
        settleMonth,
        fairBasisRateE8,
        basisInYearE8,
        initKline: false,
        fundingRateGraySymbol
      };
      return newState;
    },
    []
  );

  const setInstrumentWrapper = useCallback((newState) => {
    if (newState.initKline) {
      instrumentGlobalState.current = {
        ...instrumentGlobalState.current,
        initKline: false,
        klineLastPrice: 0,
        klineMarkPrice: 0
      };
    } else if (newState.symbol === instrumentGlobalState.current.symbol) {
      instrumentGlobalState.current = {
        ...instrumentGlobalState.current,
        ...newState
      };
    } else {
      instrumentGlobalState.current = { ...newState };
    }

    setInstrument(instrumentGlobalState.current);
  }, []);

  useEffect(() => {
    const subscriber = instrumentStream.subscribe((instrumentParam) => {
      let newState = {};

      if (instrumentParam && instrumentParam.ip) {
        instrumentParam.indexPrice = instrumentParam.ip;
        instrumentParam.prevPrice24h = instrumentParam.p24;
        instrumentParam.price24hPcntE6 = instrumentParam.pP;
      }

      // console.log("instrumentParam.subscribe:",instrumentParam);
      // initKline: K线图时长、种类切换，需要 init lastPrice和markPrice
      if (instrumentParam && instrumentParam.initKline) {
        // instrumentParam.indexPrice = instrumentParam.ip;
        // instrumentParam.prevPrice24h = instrumentParam.p24;
        // instrumentParam.price24hPcntE6 = instrumentParam.pP;
        newState = instrumentParam;
      } else {
        if (instrumentParam && instrumentParam.symbol !== symbol) {
          // 解决 unsubscribe BehaviorSubject 时断流，无法更新 last value，导致每次重新订阅时，拿到的都是旧值
          instrumentParam = {};
        }

        newState = handleInstrumentParam(
          instrumentParam,
          priceFraction,
          lotFraction
        );
      }
      setInstrumentWrapper(newState);
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [curSymbolConfig]);

  return instrument;
};

export default useInstrumentStore;
