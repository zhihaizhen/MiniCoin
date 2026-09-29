import { useState, useEffect, useCallback } from 'react';
import { useSymbolConfig } from '../../../store-hooks/use-symbol-config';
import { orderbookStream } from '../streams/indexQuoteStream.stream';

const useOrderbookStream = () => {
  const { curSymbolConfig } = useSymbolConfig();
  const { priceScale = 4, maxPrice = 1e6, symbol } = curSymbolConfig;

  const getInitalOBData = useCallback(
    () => ({
      rxBuyList: [],
      rxSellList: [],
      rxDepthGroupedSellList: [],
      rxDepthGroupedBuyList: []
    }),
    []
  );

  const getInitalOBMeta = useCallback(
    () => ({
      bid1Id: 0,
      ask1Id: 0,
      bid1Price: 0,
      ask1Price: 0
    }),
    []
  );

  const [orderbookData, setOrderbookData] = useState(getInitalOBData());
  const [orderbookMeta, setOrderbookMeta] = useState(getInitalOBMeta());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const subscription = orderbookStream.subscribe((obDetail) => {
      if (!obDetail) return;

      const {
        bid1Id = 0,
        ask1Id = 0,
        Buy = [],
        Sell = [],
        loaded: obLoaded,
        depthGroupedBuyList = [],
        depthGroupedSellList = []
      } = obDetail;

      if (Buy[0] && Buy[0].symbol !== symbol) {
        // 解决 unsubscribe BehaviorSubject 时断流，无法更新 last value，导致每次重新订阅时，拿到的都是旧值
        return;
      }

      if (Buy && Buy.length > 0) {
        for (let i = 0; i < Buy.length; i += 1) {
          if (Buy[i].size === 0) {
            Buy.splice(i, 1);
            i -= 1;
          }
        }
      }

      if (Sell && Sell.length > 0) {
        for (let i = 0; i < Sell.length; i += 1) {
          if (Sell[i].size === 0) {
            Sell.splice(i, 1);
            i -= 1;
          }
        }
      }

      const isBuyListEmpty = (Buy || []).length === 0;
      const isSellListEmpty = (Sell || []).length === 0;
      // 0 is the smallest bid price.
      const snapshotBid1Id = isBuyListEmpty ? 0 : Buy[0]?.price;
      // 1e10 = 1e6 * 1e4, 1e6 is the largest ask price.
      const snapshotAsk1Id = isSellListEmpty
        ? maxPrice
        : Sell[Sell.length - 1]?.price;

      setOrderbookMeta({
        bid1Id,
        bid1Price: bid1Id / 10 ** priceScale || snapshotBid1Id,
        ask1Price: ask1Id / 10 ** priceScale || snapshotAsk1Id,
        ask1Id
      });
      setOrderbookData({
        rxBuyList: Buy,
        rxSellList: Sell,
        rxDepthGroupedSellList: depthGroupedSellList,
        rxDepthGroupedBuyList: depthGroupedBuyList
      });

      setLoaded(obLoaded);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [curSymbolConfig]);

  return {
    orderbookData,
    orderbookMeta,
    loaded,
    setLoaded
  };
};

export default useOrderbookStream;
