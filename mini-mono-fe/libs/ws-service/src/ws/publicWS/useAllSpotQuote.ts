import { useEffect, useState } from 'react';
import { spotAllSymbolQuoteStream } from './allSymbolObservables';
import BigNumber from 'bignumber.js';
import { intercept, toThousands } from '@unified/helpers';

// import { useSymbolConfig } from '../context/futures/symbolContext';
import { getDynamicSymbol, handleDynamicData} from '../../utils/dynamicSymbolsConfig';
import { useSpotQuoteTokenConfig } from '../context/spot/spotQuoteTokenContext';
import {
  toNumberZero,
  toThousandsNumberNoZero,
  unitNumberFormat
} from '../../utils';

const useAllSpotQuote = () => {
  const { uniqueAllTokens } = useSpotQuoteTokenConfig(); 
  const [allSymbolConfig, setAllSymbolConfig] = useState({});
  const [allSpotData, setAllSpotData] = useState({});
  const [allSpotList, setAllSpotList] = useState([]);
  const spotList = [];

  const formatData = (_data = []) => {
    const symbols = uniqueAllTokens.reduce((prev, cur) => {
      prev[cur.symbolId] = cur;
      return prev;
    }, {});

    uniqueAllTokens.forEach((config) => {
      const { symbolId: symbol } = config;
      const it = _data.filter((item) => item.s === symbol)[0]; // wsData
      if (it) {
        //  ws数据
        const {
          c: lastPrice,
          v: volume24h,
          qv: turnover24h, // 以u为单位的交易额
          m: changeTurnover24H,
          h: highPrice,
          l: lowPrice,
          // s: symbol
        } = it;
        // const curConfig = allSymbolConfig[symbol] || {};
        // console.log(allSymbolConfig,'2222allSymbolConfig',symbol, curConfig);
        // const { priceFraction, lotFraction, coin } = curConfig;


        const newNumber = BigNumber(lastPrice).toFixed();
        const newNumberNoZero = BigNumber(newNumber).toNumber();
        const formattedLastPrice = BigNumber(newNumberNoZero).toFormat() // 转为千分位

        const formattedVolume24h = unitNumberFormat(volume24h, 0); // 成交量做转换
        const formattedTurnover24h = unitNumberFormat(toNumberZero(turnover24h) / 1, 0);
        const { baseTokenId, quoteTokenId } = symbols[symbol] || {};
        const symbolAlias = `${baseTokenId}/${quoteTokenId}`;

        const highPriceNum = toNumberZero(highPrice); // 先去0
        const lowPriceNum =
          lowPrice === undefined || lowPrice === null
            ? undefined
            : toNumberZero(lowPrice);
        const singleData = {
          ...symbols[symbol],
          symbol,
          symbolAlias,
          changeTurnover24H,
          changeRate24H: toThousandsNumberNoZero(changeTurnover24H *100,2),
          lastPriceNumber: newNumberNoZero,
          highPrice: highPriceNum,
          lowPrice: lowPriceNum,
          highPriceNum,
          formattedLastPrice,
          formattedVolume24h,
          volume24h,
         formattedTurnover24h,
         turnover24h,
          // priceFraction,
          // lotFraction,
          type: 'spot',
          origin: {
            ...it[symbol]
          }
        };

        // 之前存在则修改,不存在则push
        const index = spotList.findIndex((it) => it?.symbol === symbol);
        if (index > -1) {
          spotList[index] = singleData;
        } else {
          spotList.push(singleData);
        }
        symbols[symbol] = singleData;
      }
    });
    setAllSpotData({ ...symbols });
    setAllSpotList([...spotList]);
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getDynamicSymbol();
  //     const { allSymbolConfig } = handleDynamicData(data);
  //     setAllSymbolConfig(allSymbolConfig);
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    const subscription = spotAllSymbolQuoteStream.subscribe((data) => {
      if (!data) return;
      formatData(data);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [uniqueAllTokens.length, allSymbolConfig]);

  return { allSpotData, allSpotList };
};

export { useAllSpotQuote };
