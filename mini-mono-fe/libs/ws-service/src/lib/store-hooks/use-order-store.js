import { useGlobalState } from '../store';
import { transformNum } from '@unified/helpers';
import { useGlobalSymbolConfig } from '../common/hooks/use-global-symbol-config';
import { TP_SL } from '../common/packages-biz/by-global-settings/usdt-settings';
import { getSymbolConfig } from '../common/utils/order';
import { useMemo } from 'react';

const useOrderStore = () => {
  const [state] = useGlobalState();
  const { allSymbolConfig } = useGlobalSymbolConfig();
  const { position, symbol } = state;
  const {
    positionList: { list: positionList = [], loaded: isPositionLoaded = false },
    activityList: { list: activityList = [], loaded: isActivityLoaded = false },
    conditionsList: {
      list: conditionsList = [],
      loaded: isConditionsLoaded = false
    },
    historyList: { list: historyList = [] }
  } = position;

  // 止盈止损
  const tpslList = state?.position?.tpslList?.data ?? { Buy: [], Sell: [] };
  const buyTpslList = tpslList.Sell; // 仓位跟止盈止损的方向相反。好像是因为tpslList数据的side跟position是反的
  const sellTpslList = tpslList.Buy; // 仓位跟止盈止损的方向相反

  // 获取止盈或者止损的size
  const getTpslSize = (symbol, list) => {
    const sizeArr = [0, 0];
    list
      .filter((it) => it.symbol === symbol)
      .forEach((item) => {
        if (
          item?.stopOrderType === TP_SL.TAKEPROFIT ||
          item?.stopOrderType === TP_SL.PARTIAL_TAKEPROFIT
        ) {
          sizeArr[0] = transformNum(sizeArr[0], item?.qty ?? 0, 'plus');
        } else if (
          item?.stopOrderType === TP_SL.STOPLOSS ||
          item?.stopOrderType === TP_SL.PARTIAL_STOPLOSS
        ) {
          sizeArr[1] = transformNum(sizeArr[1], item?.qty ?? 0, 'plus');
        }
      });
    return sizeArr;
  };

  const {
    buyActivityList,
    sellActivityList,
    currentActivityList,
    allActivityList
  } = useMemo(() => {
    const list = {
      buyActivityList: [],
      sellActivityList: [],
      currentActivityList: [],
      allActivityList: []
    };
    activityList.forEach((activity) => {
      const symbolConfig = getSymbolConfig(activity.symbol, allSymbolConfig);
      list.allActivityList.push({ ...activity, ...symbolConfig });
      if (activity.symbol === symbol) {
        list.currentActivityList.push({ ...activity, ...symbolConfig });
        if (list[`${activity.side.toLowerCase()}ActivityList`]) {
          list[`${activity.side.toLowerCase()}ActivityList`].push(activity);
        }
      }
    });
    return list;
  }, [activityList]);

  const { allConditionsList, currentConditionsList } = useMemo(() => {
    const list = {
      allConditionsList: [],
      currentConditionsList: []
    };
    conditionsList.forEach((conditions) => {
      const symbolConfig = getSymbolConfig(conditions.symbol, allSymbolConfig);
      list.allConditionsList.push({ ...conditions, ...symbolConfig });
      if (conditions.symbol === symbol) {
        list.currentConditionsList.push({ ...conditions, ...symbolConfig });
      }
    });
    return list;
  }, [conditionsList]);

  return {
    positionList,
    activityList: allActivityList,
    conditionsList: allConditionsList,
    historyList,
    isActivityLoaded,
    isConditionsLoaded,
    isPositionLoaded,
    buyTpslList,
    sellTpslList,
    buyTpslSize: (symbol) => getTpslSize(symbol, buyTpslList),
    sellTpslSize: (symbol) => getTpslSize(symbol, sellTpslList),
    buyActivityList,
    sellActivityList,
    currentActivityList,
    currentConditionsList
  };
};

export default useOrderStore;
