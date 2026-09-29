// @ts-nocheck
import Decimal from 'decimal.js';
import BigNumber from 'bignumber.js';
import {
  GRID_GUTTER,
  GRID_ITEMS,
  GRID_ROW_HEIGHT,
  LEVEL_HEIGHT,
  OB_LARGE_REMAIN_HEIGHT,
  REMAIN_HEIGHT,
} from '@/constants/layout';

type TNumberOrString = number | string;

/**
 * 累加
 * params: a, b, c...
 * return a + b + c
 */
export const add = (...rest: TNumberOrString[]) => {
  let result = new Decimal(rest.splice(0, 1)[0]);
  rest.forEach((v) => {
    result = new Decimal(result).add(new Decimal(v));
  });

  return result.toNumber();
};

/**
 * 累减
 * params: a, b, c...
 * return a - b - c
 */
export const sub = (...rest: TNumberOrString[]) => {
  let result = new Decimal(rest.splice(0, 1)[0]);
  rest.forEach((v) => {
    result = new Decimal(result).sub(new Decimal(v));
  });

  return result.toNumber();
};


export const getFormatData = (val:number) => {
  if(Number.isNaN(val) || !Number.isFinite(val)){
    return 0
  }
  return val
}

//  ob计算用到的
 export const calcOrderbookHeight = (height, isFull) => {
  const remainHeight = isFull ? OB_LARGE_REMAIN_HEIGHT : REMAIN_HEIGHT;
  const calcTotalHeight =
    GRID_ROW_HEIGHT * height + (height - 1) * GRID_GUTTER - remainHeight;
  const calcHeight = isFull ? calcTotalHeight : calcTotalHeight / 2;
  const level = Math.floor(calcHeight / LEVEL_HEIGHT);

  return [calcHeight, level];
};


export const addTotal = (prev, cur) => {
  const prevTotal = prev.length ? prev[prev.length - 1].total || 0 : 0;
  return [
      ...prev,
      {
          ...cur,
          total: new BigNumber(cur.size).plus(prevTotal).toNumber(),
      },
  ];
};

export const addWidth = (list, maxSize) => {
  return list.map(it => {
    const width = (it.total / maxSize) * 100;
    return { ...it, width };
  });
}

// 正向 把btc转为usdt， 反向把USD转为btc。接口返回的数量单位是contractCoin
export const getWalletCoinOb = (isInverse:boolean,type:string ,list:any) => {
  const copyList = [].concat(list)
  let res =[];
 if(type === 'BUY'){
    res = copyList.map((it,i) => {
      it.turnSize = isInverse? it.size /it.price: it.price * it.size
      it.turnTotal = i > 0 ? it.turnSize + copyList[i-1].turnTotal : it.turnSize
    return it
    })
    return res
 }

 if(type === 'SELL'){
   const reverseCopylList = copyList.reverse();
   res = reverseCopylList.map((it,i) => {
     it.turnSize =  isInverse? it.size /it.price: it.price * it.size
     it.turnTotal = i > 0 ? it.turnSize + reverseCopylList[i-1].turnTotal : it.turnSize
    return it
   }).reverse()
  return res
 }
 return res
}


