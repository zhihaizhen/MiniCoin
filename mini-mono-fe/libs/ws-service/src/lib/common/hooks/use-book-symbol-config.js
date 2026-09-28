import { useMemo } from 'react';
import { useGlobalState } from '../../store';
import { useGlobalSymbolConfig } from './use-global-symbol-config';
import { sortDown } from '../utils/sort';

export const useBookSymbolConfig = () => {
  const [state] = useGlobalState();
  const {
    bookSymbol: { bookedSymbolList = [] }
  } = state;
  const {
    allSymbolConfig, // 所有symbol的一个 Map 集合
    allSymbolList, // inverse linear inverseFuture 三个 tab list
    fetchSymbolList,
    allTags // 二级tab栏展示的tag分类
  } = useGlobalSymbolConfig();

  return useMemo(() => {
    const tagList = allTags ? allTags.split(',') : [];

    const tmpBookAndTagMap = {};
    tmpBookAndTagMap.HOT = []; // HOT默认就存在. 防止接口挂掉
    tagList.forEach((tag) => {
      tmpBookAndTagMap[tag] = [];
    });

    // 用户收藏的数据
    tmpBookAndTagMap.book = bookedSymbolList
      .map((item) => allSymbolConfig[item])
      .filter(Boolean);

    // 标签数据
    Object.values(allSymbolConfig).forEach((symbolConfig) => {
      if (symbolConfig.contractType === 'InverseFutures') {
        return;
      }
      const tmpSymbolConfig = {};
      tmpSymbolConfig.symbol = symbolConfig.symbol;
      tmpSymbolConfig.symbolName = symbolConfig.symbolName;
      tmpSymbolConfig.symbolTags = symbolConfig.symbolTags || ''; // NEW tag的展示
      tmpSymbolConfig.startTradingTime = symbolConfig.startTradingTime;
      // HOT的数据
      tmpBookAndTagMap.HOT.push(tmpSymbolConfig);
      // HOT以外的标签数据
      const symbolTags = symbolConfig.symbolTags || '';
      symbolTags
        .split(',')
        .filter((tag) => tag !== 'HOT' && tag in tmpBookAndTagMap)
        .forEach((tag) => {
          tmpBookAndTagMap[tag].push(tmpSymbolConfig);
        });
    });

    // LSNEW 按上币时间排序
    tmpBookAndTagMap.LSNEW = sortDown(
      tmpBookAndTagMap.LSNEW || [],
      'startTradingTime'
    );

    return {
      allSymbolConfig, // 所有symbol的一个 Map 集合
      fetchSymbolList,
      allTags: ['HOT', ...tagList.filter((tag) => tag !== 'HOT')],
      tagAndAllSymbolMap: { ...allSymbolList, ...tmpBookAndTagMap }
    };
  }, [
    allTags,
    bookedSymbolList,
    allSymbolConfig,
    fetchSymbolList,
    allSymbolList
  ]);
};
