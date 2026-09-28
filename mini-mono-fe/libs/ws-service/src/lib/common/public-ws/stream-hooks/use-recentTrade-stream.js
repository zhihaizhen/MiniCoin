import { useState, useEffect } from 'react';
import { useSymbolConfig } from '../../../store-hooks/use-symbol-config';
import { recentTradeStream } from '../streams/indexQuoteStream.stream';

const useRecentTradeStream = () => {
  const {
    curSymbolConfig: { symbol }
  } = useSymbolConfig();

  const [recentTrade, setRecentTrade] = useState({
    loaded: false,
    list: []
  });

  useEffect(() => {
    const subscription = recentTradeStream.subscribe((rtDetail) => {
      if (!rtDetail) return;

      const { list = [], loaded } = rtDetail;

      if (list[0] && list[0].symbol !== symbol) {
        // 解决 unsubscribe BehaviorSubject 时断流，无法更新 last value，导致每次重新订阅时，拿到的都是旧值
        return;
      }

      setRecentTrade({
        list,
        loaded
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [symbol]);

  return recentTrade;
};

export default useRecentTradeStream;
