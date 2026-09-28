import { useState, useEffect, useCallback } from 'react';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { orderbookStream } from '../streams/indexQuoteStream.stream';

const useOrderbookStream = () => {
  const {  maxPrice = 1e6, symbolAlias } = useCurSymbolConfig();

  // 给ob的数据
  const getInitalOBData = useCallback(
    () => ({
      rxBuyList: [],
      rxSellList: [],
      bid1Price: 0,
      ask1Price: 0,
    }), []);

  const [orderbookData, setOrderbookData] = useState(getInitalOBData());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const subscription = orderbookStream.subscribe((obDetail = {}) => {
      if (!obDetail.data) return;
      // a= [['82718.27', '1.3889'],['82719.21', '0.0115']] price qty
      const {
        a: sellOriginList,  // ask卖盘
        b: buyOriginList,  // bids 买盘
      } = obDetail.data[0];
      const { symbol } = obDetail;
      if (symbol !== symbolAlias) {
        // 解决 unsubscribe BehaviorSubject 时断流，无法更新 last value，导致每次重新订阅时，拿到的都是旧值
        return;
      }

      const buyList = buyOriginList.map(it => {
        return {
          price: it[0],
          size: it[1],
        };
      })

      const sellList = sellOriginList.map(it => {
        return {
          price: it[0],
          size: it[1],
        };
      }).reverse();

      const isBuyListEmpty = (buyList || []).length === 0;
      const isSellListEmpty = (sellList || []).length === 0;

      const bid1Price = isBuyListEmpty ? 0 : buyList[0].price;
      const ask1Price = isSellListEmpty ? maxPrice : sellList[sellList.length - 1].price;
    
      // console.log("orderbook-sell", sellList,ask1Price);
      // console.log("orderbook-buy", buyList,bid1Price);

      setOrderbookData({
        bid1Price,
        ask1Price,
        rxBuyList: buyList,
        rxSellList: sellList,
      });

      setLoaded(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ maxPrice, symbolAlias]);


  return {
    orderbookData,
    loaded,
    setLoaded,
  };
};

export default useOrderbookStream;
