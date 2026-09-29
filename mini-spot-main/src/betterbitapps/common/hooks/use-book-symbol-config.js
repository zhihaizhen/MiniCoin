import { sortDown } from 'common/utils/sort';
import { useMemo } from 'react';
import { useGlobalState } from '@/store';

export const useBookSymbolConfig = () => {
  const [state] = useGlobalState();
  const {
    bookSymbol: { bookedSymbolList = [] },
    allSpotTokenConfig,
    allSpotTokenList,
    walletCoin,
  } = state;

  return useMemo(() => {
    const spotTabList = {
      all: [],
      book: [],
      ...allSpotTokenList,
    };

    const tokenList = [];  // [USDT USDC]
    Object.entries(allSpotTokenList).forEach(([token, list]) => {
      tokenList.push(token);
      spotTabList.all = spotTabList.all.concat(...list);
    });

    // 用户收藏的数据  bookedSymbolList=['BTCUSDT','ETHUSDT']
    spotTabList.book = bookedSymbolList
      .map((item) => {
        let res = null;
        tokenList.forEach(token => {
          if (item.includes(token)) {
            // 分离BTC和USDT
            const regex = new RegExp(`^(.+)(${token})$`);
            const match = item.match(regex);
            if (match) {
              const baseCurrency = match[1]; // BTC
              const quoteCurrency = match[2]; // USDT
              res = allSpotTokenConfig?.[quoteCurrency]?.[baseCurrency]
            }
          }
        });
        return res
      })

    // console.log('useBookSymbolConfig_spotTabList',tokenList, bookedSymbolList, spotTabList);
    return {
      spotTabList,
    };
  }, [bookedSymbolList, allSpotTokenList, walletCoin]);
};
