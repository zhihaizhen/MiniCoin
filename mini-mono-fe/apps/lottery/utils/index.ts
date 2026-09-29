// @ts-nocheck
import dayjs from 'dayjs';
import { easicoinDomain } from '~/constants';
import { isApp } from '@better-bit-fe/base-utils';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { basePath } from '~/env';

export function formatThousandDigit(val: string) {
  if (String(val)?.includes('.')) {
    const splitValue = val.split('.');
    const formatInt = Number(splitValue[0]).toLocaleString();
    const decimals = splitValue[1];
    return formatInt + '.' + decimals;
  } else {
    if (val === 'NaN') {
      return '-';
    }
    return Number(val).toLocaleString();
  }
}

export function emailCheck(val: string) {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
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
    // let lang = getLang();
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

export function formatTimeDifference(timestamp) {
  // 将 10 位时间戳（秒）转换为毫秒
  const targetTime = timestamp * 1000;
  // 获取当前时间的毫秒数
  const now = Date.now();
  // 检查目标时间是否为过去时间
  if (targetTime < now) {
    return '0,0,0,0';
  }
  // 计算时间差（毫秒）
  let diff = Math.abs(now - targetTime);

  // 计算天数
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff %= 1000 * 60 * 60 * 24;

  // 计算小时数
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff %= 1000 * 60 * 60;

  // 计算分钟数
  const minutes = Math.floor(diff / (1000 * 60));
  diff %= 1000 * 60;

  // 计算秒数
  const seconds = Math.floor(diff / 1000);

  // 补零函数
  function padZero(num) {
    return num.toString().padStart(2, '0');
  }

  // 格式化输出
  return `${days},${padZero(hours)},${padZero(minutes)},${padZero(seconds)}`;
}

// 判断是否在app内
export function isInApp() {
  return (
    navigator && navigator.userAgent && navigator.userAgent.includes('bit_app')
  );
}

const getFormat = (time) => {
  return time < 10 ? '0' + time : time;
};

/**
 *
 * @param registerTime 秒级时间戳
 * @param cb
 */
export const countdownFormat = (registerTime:number, cb) => {
  const endTimeStamp = registerTime;
  const updateCountdown = () => {
    const nowTimeStamp = dayjs().unix();
    if (endTimeStamp > nowTimeStamp) {
      const mss = (endTimeStamp - nowTimeStamp) * 1000;

      const days = Math.floor(mss / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((mss % (1000 * 60)) / 1000);
      // console.log('nowTimeStamp111', nowTimeStamp,mss,seconds)
      // 调用回调函数返回倒计时
      cb({
        days: getFormat(days),
        hours: getFormat(hours),
        minutes: getFormat(minutes),
        seconds: getFormat(seconds)
      });
    } else {
      clearInterval(intervalId); // 倒计时结束，清除定时器
      cb({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
      console.log('倒计时结束', endTimeStamp, registerTime);
    }
  };
  const intervalId = setInterval(updateCountdown, 1000); // 每秒更新一次
};

export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

// 格式化UTC时间戳为年月日格式
export const formatTimestamp = (timestamp: number): string => {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
};


export const getRandomId = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 34; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
