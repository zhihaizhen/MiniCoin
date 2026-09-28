// @ts-nocheck

import { intercept, toThousands } from '@unified/helpers';
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

// 把数字转化为K,M,B。默认保留两位小数
export const numberFormat = (val, fraction = 2) => {
  let res = val;
  let newFraction = fraction;
  let unit = '';
  // 如果小于1000则直接返回,k以上的保留两位小数，
  if (val > 1e3 && val < 1e6) {
    res = val / 1e3;
    unit = 'K';
    newFraction = 2;
  } else if (val > 1e6 && val < 1e10) {
    res = val / 1e6;
    unit = 'M';
    newFraction = 2;
  } else if (val > 1e10) {
    res = val / 1e10;
    unit = 'B';
    newFraction = 2;
  }

  // 最后加逗号,默认保留2位小数
  return `${toThousands(res, newFraction)} ${unit}`;
};

export const toNumberZero = (number) =>
  Number.isNaN(Number(number)) ? 0 : Number(number);

export function emailCheck(val: string) {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
}

export function getLang() {
  if (typeof window !== 'undefined') {
    const langReg = /([a-z]{2}-[A-Z]{2})/;
    let refLang = location.href.match(langReg);
    if (refLang) {
      refLang = refLang[0];
    }
    const lang = refLang || localStorage.getItem('LANG_KEY') || 'zh-CN';
    //获取到之后set
    localStorage.setItem('LANG_KEY', lang);
    return lang;
  }
  return 'en-US';
}

export const getUrlAfterLangChange = (path) => {
  if (typeof window !== 'undefined') {
    const langReg = /([a-z]{2}-[A-Z]{2,3})/;
    const lang = getLang();
    // 导航上有语言，直接拼接
    //如果是en-US/aboutUs点击呢
    // if (langReg.test(location.href)) {
    //   lang = location.href.match(langReg)[0];
    // }

    const newUrl = `/${lang}${path}/`;
    return newUrl;
  }
  console.log('newUrl no broswer', path);
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

export const ACTIVE_TAB = {
  FUTURES: 'futures',
  SPOTS: 'spots',
  GAINERS: 'gainers',
}

export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

// 跳转到注册页面，并携带返回页面参数
export const handleLoginJumpWithReturnPage = () => {
  const lang = getLang();
  const origin = window.location.origin;
  const returnPageParam = window.btoa(
    `${location.origin}/${lang}/referral`
  );
  window.location.href = `${origin}/${lang}/account/login?return_page=${returnPageParam}`;
};
