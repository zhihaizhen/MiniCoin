import { useEffect, useState } from 'react';
import { intercept, toThousands } from '@unified/helpers';
import { futureSymbolQuoteStream } from './allSymbolObservables';
import { useSymbolConfig } from '../context/futures/symbolContext';
import {
  isInverseBySymbol,
  toNumberZero,
  unitNumberFormat,
  toThousandsNumberNoZero,
  FUTURE_TYPE,
  LINEAR_CATEGORY_TYPE
} from '../../utils';

const defaultFutureData = {
  [FUTURE_TYPE.INVERSE]: [],
  [FUTURE_TYPE.LINEAR]: [],
  [FUTURE_TYPE.BLOCK]: [],
};

const useAllSymbolQuote = () => {
  const [futureListWithType, setFutureListWithType] =
    useState(defaultFutureData);
  const [allFutureList, setAllFutureList] = useState([]);
  const [allFutureData, setAllFutureData] = useState({});
  const { symbolConfig } = useSymbolConfig();

  useEffect(() => {
    const subscription = futureSymbolQuoteStream.subscribe((data) => {
      if (!data) return;
      const quoteDataWithType = {
        [FUTURE_TYPE.INVERSE]: [],
        [FUTURE_TYPE.LINEAR]: [],
        [FUTURE_TYPE.BLOCK]: [],
      };
      const allQuoteData = {};
      const allQuoteList = [];
      Object.keys(data).forEach((index) => {
        const {
          p: lastPrice,
          mp: markPrice,
          ip: indexPrice,
          h: highPrice24h,
          l: lowPrice24h,
          v: volume24h, //
          to: turnover24h, //正向取to, 反向取 v
          pP, // 24小时的价格变化比例，%的e4，price24hPcntE6
          p24, // prevPrice24h,
          s: symbol,
          td: lastTickDirection
        } = data[index];
        const hasExit = symbolConfig.filter((it) => it.symbolName === symbol);

        if (hasExit.length) {
          const curConfig = hasExit[0] || {};
          const { priceFraction, lotFraction, coin, symbolAlias, symbolCategory, contractType, sectionIds } = curConfig;
          const price24hPcntE6 = pP;
          const prevPrice24h = p24;
          const lastPriceNum = toNumberZero(lastPrice);
          const markPriceNum = toNumberZero(markPrice);
          const indexPriceNum = toNumberZero(indexPrice);
          const highPriceNum = toNumberZero(highPrice24h);
          const lowPriceNum = toNumberZero(lowPrice24h);

          const formattedLastPrice = toThousandsNumberNoZero(
            lastPriceNum,
            priceFraction
          );
      
          // u本位
          const formattedVolume24h = unitNumberFormat(volume24h, lotFraction);
          // 币本位
          const formattedTurnover24h = unitNumberFormat(toNumberZero(turnover24h) / 1, lotFraction) ;

          const changeTurnover24H = toNumberZero(
            intercept(lastPriceNum - prevPrice24h, priceFraction) / 1e2
          ).toFixed(2);
          const changeRate24H = toNumberZero(
            intercept(price24hPcntE6 / 1e4, 2)
          );
          const singleData = {
            sectionIds: sectionIds || [],
            symbol,
            symbolAlias: symbolAlias || symbol, //有一种情况是后端ws推送了多个symbol，但是dynamic里只有少量
            lastPriceNumber: lastPriceNum,
            markPriceNumber: markPriceNum,
            indexPriceNumber: indexPriceNum,
            lastPrice: lastPriceNum,
            markPrice: markPriceNum,
            indexPrice: indexPriceNum,
            highPrice: highPriceNum,
            lowPrice: lowPriceNum,
         
            formattedLastPrice,
            formattedVolume24h,
            volume24h,
            formattedTurnover24h,
            turnover24h,
            coin,
            changeTurnover24H,
            changeRate24H,
           
            // symbolOrder, //顺序
            type: 'futures',
            symbolCategory,
            contractType,
            priceFraction,
            lotFraction,
            origin: {
              ...data[symbol]
            }
          };

          // 
          if (isInverseBySymbol(contractType)) {
            (singleData.contractType = FUTURE_TYPE.INVERSE),
              quoteDataWithType[FUTURE_TYPE.INVERSE].push(singleData);
          } else {
            if (symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK) {
              quoteDataWithType[FUTURE_TYPE.BLOCK].push(singleData);
            } else {
              quoteDataWithType[FUTURE_TYPE.LINEAR].push(singleData);
            }
          }
          allQuoteData[symbol] = singleData;
          allQuoteList.push(singleData);
        }
      });
      setFutureListWithType(quoteDataWithType);
      setAllFutureData(allQuoteData);
      setAllFutureList(allQuoteList);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [symbolConfig]);
  return { allFutureData, allFutureList, futureListWithType };
};

export { useAllSymbolQuote };
