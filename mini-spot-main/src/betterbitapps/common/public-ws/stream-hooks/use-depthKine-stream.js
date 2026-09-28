import { useState, useEffect, useCallback } from 'react';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { depthStream } from '../streams/indexQuoteStream.stream';

const useDepthKineStream = () => {
  const { symbolAlias } = useCurSymbolConfig();

  const getInitalOBData = useCallback(
    () => ({
      rxBuyList: [],
      rxSellList: [],
    }),[]);
  const [depthKineData, setDepthKineData] = useState( getInitalOBData());
  const [depthLoaded, setDepthLoaded] = useState(false);


  // 深度图数据订阅
  useEffect(() => {
    const subscription = depthStream.subscribe((wsdata) => {
      // console.log("deep-kine-wsdata444", wsdata);
      if (!wsdata) return;
      const {
        a: sellOriginList,  // ask卖盘
        b: buyOriginList,  // bids 买盘
      } = wsdata.data[0];
      const { symbol } = wsdata;
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


      setDepthKineData({
        rxBuyList: buyList,
        rxSellList: sellList,
      });
      setDepthLoaded(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [symbolAlias]);

  return {
    depthKineData,
    depthLoaded,
  };
};

export default useDepthKineStream;
