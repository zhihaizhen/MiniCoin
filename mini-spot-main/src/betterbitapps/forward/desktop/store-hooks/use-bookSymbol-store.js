import { useGlobalState } from '@/store';
import { useMemo } from 'react';

const useBookSymbolStore = () => {
  const [state] = useGlobalState();
  const {
    allSpotTokenConfig,
    allSpotTokenList,
    bookSymbol: { bookedSymbolList = [] },
    walletCoin,
  } = state;

  const allSymbolList = useMemo(() => {
    return allSpotTokenList?.[walletCoin]
  }, [allSpotTokenList]);
  const bookList = [];
  bookedSymbolList.forEach((targetSymbol) => {
    allSymbolList.forEach((symbolItem) => {
      if (symbolItem.symbolAlias === targetSymbol) {
        bookList.push(symbolItem);
      }
    });
  });
  // console.log('useBookSymbolStore_allSymbolList', allSymbolList,bookedSymbolList,bookList);
  return {
    bookList,
    bookedSymbolList,
  };
};

export default useBookSymbolStore;
