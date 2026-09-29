import { intercept, toThousands } from '@unified/helpers';
import { useGlobalSymbolConfig } from '../../hooks/use-global-symbol-config';
import { TICK_DIRECTION } from '../../packages-biz/by-global-settings';
import AllSymbolQuoteStream from '../../public-ws/streams/allSymbolQuote.stream';
import { toNumberZero } from '../../utils/utils';
import { useEffect, useState } from 'react';

const useAllSymbolQuoteData = () => {
  const [allSymbolQuoteData, setAllSymbolQuoteData] = useState({});
  const { allSymbolConfig } = useGlobalSymbolConfig();

  useEffect(() => {
    const subscription = AllSymbolQuoteStream.subscribe((data) => {
      if (!data) return;
      const allQuoteData = {};
      // console.log("row tick.all:");
      Object.keys(data).forEach((symbol) => {
        const {
          lastTickDirection,
          lastPrice,
          markPrice,
          indexPrice,
          volume24h,
          // price24hPcntE6,
          turnover24h,
          pP, // 24小时的价格变化比例，%的e4，price24hPcntE6
          p24 // prevPrice24h,
        } = data[symbol];
        const { priceFraction, coin } = allSymbolConfig[symbol] || {};

        const price24hPcntE6 = pP;
        const prevPrice24h = p24;
        // const markPrice = mp;
        // const indexPrice = ip;
        // const lastPrice = l;
        // const turnover24h = to;
        // const volume24h = v;
        // const lastTickDirection = td;
        //
        const lastPriceNum = toNumberZero(lastPrice);
        const markPriceNum = toNumberZero(markPrice);
        const indexPriceNum = toNumberZero(indexPrice);
        const formattedLastPrice = toThousands(lastPriceNum, priceFraction);
        const formattedVolume24h = toNumberZero(volume24h);
        const turnover24hNumber = toNumberZero(turnover24h) / 1;
        const isLastPricePlus =
          TICK_DIRECTION.PLUS === lastTickDirection ||
          TICK_DIRECTION.ZERO_PLUS === lastTickDirection;
        const isLastPriceMinus =
          TICK_DIRECTION.MINUS === lastTickDirection ||
          TICK_DIRECTION.ZERO_MINUS === lastTickDirection;
        const changeTurnover24H = toNumberZero(
          intercept(lastPriceNum - prevPrice24h, priceFraction)
        );
        const changeRate24H = toNumberZero(intercept(price24hPcntE6 / 1e4, 2));
        allQuoteData[symbol] = {
          symbol,
          lastPriceNumber: lastPriceNum,
          markPriceNumber: markPriceNum,
          indexPriceNumber: indexPriceNum,
          lastPrice: lastPriceNum,
          markPrice: markPriceNum,
          indexPrice: indexPriceNum,
          formattedLastPrice,
          volume24h: formattedVolume24h,
          coin,
          isLastPricePlus,
          isLastPriceMinus,
          changeTurnover24H,
          changeRate24H,
          turnover24h: turnover24hNumber,
          origin: {
            ...data[symbol]
          }
        };
      });
      setAllSymbolQuoteData(allQuoteData);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [allSymbolConfig]);
  return allSymbolQuoteData;
};

export default useAllSymbolQuoteData;
