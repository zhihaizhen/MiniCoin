import { intercept, toThousands } from '@unified/helpers';
import BigNumber from 'bignumber.js';
// @ts-nocheck
export function formatThousandDigit(val: string) {
  if (val?.includes('.')) {
    const splitValue = val.split('.');
    const formatInt = Number(splitValue[0]).toLocaleString();
    const decimals = splitValue[1];
    return formatInt + '.' + decimals;
  } else {
    return Number(val).toLocaleString();
  }
}

// 注意注意：contractType仅判断正向（所有类型LINEAR_CATEGORY_TYPE）和反向, 用于计算层面
export const isInverseBySymbol = (contractType:string) => contractType === FUTURE_TYPE.INVERSE;

// 后端dynamic接口，通过返回的symbolCategory字段,来具体区分类型
// 以下在后端返回的contractType都是LinearPerpetual，表示在计算公式层面都属于正向
export const LINEAR_CATEGORY_TYPE = {
  CRYPTO: 'crypto',
  GOLD: 'gold', 
  STOCK: 'stock',
  METAL: 'metal',
  BLOCK: 'block',
};

// 合约业务上合约又分为，正向，反向，大宗
export const FUTURE_TYPE = {
  LINEAR: 'LinearPerpetual',
  INVERSE: 'InversePerpetual',
  BLOCK: 'BlockTradePerpetual'
};



export const toNumberZero = (number) =>
  Number.isNaN(Number(number)) ? 0 : Number(number);

export const toThousandsNumberNoZero = (number, precision) => {
  const newNumber = BigNumber(number).toFixed(precision);
  const newNumberNoZero = BigNumber(newNumber).toNumber();
  return BigNumber(newNumberNoZero).toFormat();
};

export function emailCheck(val: string) {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
}

export function getLang() {
  if (typeof window !== 'undefined') {
    const langReg = /([a-z]{2}-[A-Z]{2})/;
    let refLang = location.href.match(langReg);
    if (refLang) {
      // @ts-ignore
      refLang = refLang[0];
    }
    const lang = refLang || localStorage.getItem('LANG_KEY') || 'zh-CN';
    // @ts-ignore
    localStorage.setItem('LANG_KEY', lang);
    return lang;
  }
  return 'en-US';
}

export const getUrlAfterLangChange = (path) => {
  if (typeof window !== 'undefined') {
    const lang = getLang();
    const newUrl = `/${lang}${path}/`;
    return newUrl;
  }
  return path;
};

export const throttle = (fun: () => void, delay: number) => {
  let [last, deferTimer]: [number, NodeJS.Timer | undefined] = [0, undefined];
  return function () {
    const now: number = +new Date();
    if (last && now < last + delay) {
      deferTimer && clearTimeout(deferTimer as NodeJS.Timer);
      deferTimer = setTimeout(function () {
        last = now;
        fun();
      }, delay);
    } else {
      last = now;
      fun();
    }
  };
};

// 把数字转化为K,M,B
export const unitNumberFormat = (val, lotFraction = 2) => {
  let res = val;
  let unit = '';
  // 如果小于1000则直接返回
  if (val > 1e3 && val < 1e6) {
    res = val / 1e3;
    unit = 'K';
  } else if (val > 1e6 && val < 1e10) {
    res = val / 1e6;
    unit = 'M';
  } else if (val > 1e10) {
    res = val / 1e10;
    unit = 'B';
  }
  if(lotFraction){
    // 最后加逗号,默认保留2位小数
    return `${toThousandsNumberNoZero(res, lotFraction)}${unit}`;
  }
  return `${toThousands(res)}${unit}`;
};
