import { intercept, toThousands } from '@unified/helpers';
import { futureSymbolQuoteStream as AllSymbolQuoteStream } from 'libs/ws-service';
import { useSymbolConfig } from '~/context/symbolConfig';
import { toNumberZero } from '~/utils';
import { useEffect, useState } from 'react';

const useAllSymbolQuote = () => {
  const [allSymbolQuoteData, setAllSymbolQuoteData] = useState({});
  const { symbolConfig } = useSymbolConfig();

  useEffect(() => {
    const subscription = AllSymbolQuoteStream.subscribe((data) => {
      // console.log('ws接收到的数据', data);
      if (!data) return;
      const allQuoteData = {};
      Object.keys(data).forEach((index) => {
        const {
          h: highPrice,
          p: lastPrice,
          mp: markPrice,
          ip: indexPrice,
          v: volume24h,
          to: turnover24h,
          pP, // 24小时的价格变化比例，%的e4，price24hPcntE6
          p24, // prevPrice24h,
          s: symbol,
          td: lastTickDirection
        } = data[index];
        const curConfig =
          symbolConfig.filter((it) => it.symbolName === symbol)[0] || {};
        const { priceFraction, coin, symbolAlias } = curConfig;
        const price24hPcntE6 = pP;
        const prevPrice24h = p24;
          const hignPriceNum = toNumberZero(highPrice);
        const lastPriceNum = toNumberZero(lastPrice);
        const markPriceNum = toNumberZero(markPrice);
        const indexPriceNum = toNumberZero(indexPrice);
        const formattedLastPrice = toThousands(lastPriceNum, priceFraction);
        const formattedVolume24h = toNumberZero(volume24h);
        const turnover24hNumber = toNumberZero(turnover24h) / 1;

        const changeTurnover24H = toNumberZero(
          intercept(lastPriceNum - prevPrice24h, priceFraction) / 1e2
        ).toFixed(2);
        // 产品需求把这里改成四舍五入
        const changeRate24H = toNumberZero((price24hPcntE6 / 1e4).toFixed(2));

        // const changeRate24H = toNumberZero(intercept(price24hPcntE6 / 1e4, 2));
        allQuoteData[symbol] = {
          symbol,
          symbolAlias: symbolAlias || symbol, //有一种情况是后端ws推送了多个symbol，但是dynamic里只有少量
          lastPriceNumber: lastPriceNum,
          markPriceNumber: markPriceNum,
          indexPriceNumber: indexPriceNum,
          lastPrice: lastPriceNum,
          markPrice: markPriceNum,
          indexPrice: indexPriceNum,
          formattedLastPrice,
          volume24h: formattedVolume24h,
          coin,
          changeTurnover24H,
          changeRate24H,
          turnover24h: turnover24hNumber,  
          hignPriceNum,
          // symbolOrder, //顺序
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
  }, [symbolConfig]);
  return allSymbolQuoteData;
};

export default useAllSymbolQuote;
