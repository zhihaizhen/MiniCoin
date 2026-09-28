import { useMemo } from 'react';
import { useGlobalState } from '@/store';

const useOrderStore = () => {
  const [state] = useGlobalState();
  const { position, symbol, allSpotTokenConfig, walletCoin } = state;
  const { historyEntrustList, currentEntrustList } =
    position; 
  const activityList = currentEntrustList?.data;
  // 获取活动单的数据，K线使用
  const {
    buyActivityList,
    sellActivityList,
    currentActivityList,
    allActivityList,
  } = useMemo(() => {
    const list = {
      buyActivityList: [],
      sellActivityList: [],
      currentActivityList: [],
      allActivityList: [],
    };
    activityList?.forEach((activity) => {
      const symbolConfig =
        allSpotTokenConfig?.[walletCoin]?.[activity.baseTokenName];
      list.allActivityList.push({ ...activity, ...symbolConfig });
      if (activity.baseTokenName === symbol) {
        list.currentActivityList.push({ ...activity, ...symbolConfig });
        if (list[`${activity.side.toLowerCase()}ActivityList`]) {
          list[`${activity.side.toLowerCase()}ActivityList`].push(activity);
        }
      }
    });
    return list;
  }, [activityList]);

  return {
    activityList: allActivityList,
    historyEntrustList,
    buyActivityList,
    sellActivityList,
    currentActivityList,

    currentEntrustList,
  };
};

export default useOrderStore;
