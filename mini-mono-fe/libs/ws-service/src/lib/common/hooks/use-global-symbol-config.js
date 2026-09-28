import { useMemo } from 'react';
import { useGlobalState } from '../../store';
import SymbolConfig from '@region-lib/symbol-fetch';
import { SYMBOLS, TRADE_TYPE } from '../packages-biz/by-global-settings';
import { isDex } from '../utils/env';
import { filterObject, updateSymbolTags } from '../utils/utils';

const symbolConfig =
  typeof window !== 'undefined'
    ? SymbolConfig.getInstance()
    : { allSymbolConfig: {}, allSymbolList: {}, fetchSymbolList: {} };

export const useGlobalSymbolConfig = (symbol) => {
  const [state] = useGlobalState();
  const {
    symbols: { symbolTags }
  } = state;
  const { symbolStatus, allSymbolConfig, allSymbolList, fetchSymbolList } =
    symbolConfig;
  // if (isDex) {
  //   allSymbolList[TRADE_TYPE.INVERSE] = [];
  // }

  // console.log("global symbol:",symbolConfig);

  const tempAllSymbolList = useMemo(() => {
    const tempAllSymbolList = {
      [TRADE_TYPE.INVERSE]: [],
      [TRADE_TYPE.LINEAR]: []
    };
    if (Object.keys(allSymbolList).length) {
      Object.entries(allSymbolList).forEach(([key, value]) => {
        tempAllSymbolList[key] = updateSymbolTags(value, symbolTags);
      });
    }
    return tempAllSymbolList;
  }, [allSymbolList, symbolTags]);

  const temp = { ...tempAllSymbolList };
  temp.InverseFutures = [];

  return useMemo(() => {
    let allConfig = updateSymbolTags(allSymbolConfig, symbolTags);
    if (isDex) {
      allConfig = filterObject(
        allConfig,
        (symbol) => symbol.contractType === TRADE_TYPE.LINEAR
      );
    }
    const symbolConfig = allConfig[symbol] || SYMBOLS[symbol] || {};
    return {
      symbolStatus,
      allSymbolConfig: Object.keys(allConfig).length ? allConfig : SYMBOLS, // 所有symbol的一个 Map 集合
      symbolConfig, // 单个symbol的config
      // allSymbolList: tempAllSymbolList, // inverse linear inverseFuture 三个 tab list
      allSymbolList: temp, // 屏蔽交割
      fetchSymbolList,
      allTags: symbolTags?.allTags || ''
    };
  }, [
    allSymbolConfig,
    fetchSymbolList,
    symbolTags?.allTags,
    symbol,
    symbolStatus,
    tempAllSymbolList
  ]);
};
