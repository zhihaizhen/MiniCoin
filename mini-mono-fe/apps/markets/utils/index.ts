// @ts-nocheck
import BigNumber from 'bignumber.js';

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



export function getLang() {
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

export const getUrlAfterLangChange = (path) => {
  if (typeof window !== 'undefined') {
    const langReg = /([a-z]{2}-[A-Z]{2,3})/;
    let lang = getLang();
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



export const toThousandsNumberNoZero = (number, precision) => {
  const newNumber = BigNumber(number).toFixed(precision);
  const newNumberNoZero = BigNumber(newNumber).toNumber();
  return BigNumber(newNumberNoZero).toFormat();
};
