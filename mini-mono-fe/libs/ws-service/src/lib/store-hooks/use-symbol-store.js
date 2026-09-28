import { useGlobalState } from '../store';

const useSymbolStore = () => {
  const [state] = useGlobalState();
  const {
    symbols: { totalSymbolList = {}, symbolListLoadFail },
    bookSymbol: { bookedSymbolList = [] },
    symbolTemp: { symbolTempList = [] }
  } = state;

  const bookList = [];
  bookedSymbolList.forEach((targetSymbol) => {
    Object.values(totalSymbolList).forEach((categoryItem) => {
      const symbolItem = categoryItem.find((tepSymbolItem) => {
        return tepSymbolItem.symbol === targetSymbol;
      });
      if (symbolItem) {
        bookList.push(symbolItem);
      }
    });
  });

  return {
    symbols: {
      ...totalSymbolList,
      book: bookList
    },
    symbolListLoadFail,
    bookList,
    bookedSymbolList,
    symbolTempList
  };
};

export default useSymbolStore;
