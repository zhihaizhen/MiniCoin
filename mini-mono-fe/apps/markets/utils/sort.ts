import { isInverseBySymbol } from 'libs/ws-service/src/utils';

export const sortByPre = (sortData, key, direction) => {
  // const { key, direction } = getLocalStorageSort();
  sortData.sort((a, b) => {
    return sortFun(a, b, key, direction);
  });
  return sortData;
};

export const sortFun = (a, b, sortKey = 'vol', sortDirection = 'Up') => {

 // 只有反向用volume24h，其他u本位和现货，以及大宗都用turnover24h字段排序，没有千分位的
 const isInverse = isInverseBySymbol(a.contractType);

  const keyMap = {
    price: 'lastPriceNumber',
    '24change': 'changeRate24H',
    vol: isInverse ? 'volume24h' : 'turnover24h',  // 成交额
    highLow: 'highPrice' // 24H最高价
  };
  // 正向的就不一样了
  const key = keyMap[sortKey];
  // 默认从大到小
  let v = Number(b?.[key]) - Number(a?.[key]);
  if (sortDirection !== 'Up') {
    v = Number(a?.[key]) - Number(b?.[key]);
  }

  // 如果a-b等于0，那就按照字母排序
  if (v === 0) {
    const v0 = a.symbol.charCodeAt(0) - b.symbol.charCodeAt(0);
    const v1 = a.symbol.charCodeAt(1) - b.symbol.charCodeAt(1);
    const v2 = a.symbol.charCodeAt(2) - b.symbol.charCodeAt(2);
    return v0 || v1 || v2;
  } else {
    return v;
  }
};

// export const setLocalStorageSort = (key, direction) => {
//   localStorage.setItem('MARKET_SORT_KEY', key);
//   localStorage.setItem('MARKET_SORT_DIRECTION', direction);
// };

// export const getLocalStorageSort = () => {
//   const key = localStorage.getItem('MARKET_SORT_KEY');
//   const direction = localStorage.getItem('MARKET_SORT_DIRECTION');
//   return {
//     key,
//     direction
//   };
// };
