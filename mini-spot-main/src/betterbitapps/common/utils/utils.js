// 常用工具函数，如数字格式化、字符串处理,日期格式化等
import dayjs from 'dayjs';
import { Env } from '@region-lib/env';
import {
  guid as Guid,
  intercept,
  isNumber,
  toThousands,
} from '@unified/helpers';
import BigNumber from 'bignumber.js';
import { addCookie, getCookie } from 'by-storage';

const { GUID_KEY } = Env;

const { host } = window.location;
export const domain =
  host.indexOf('localhost') !== -1
    ? 'localhost'
    : host.replace(/^www|m|testnet/, '');

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

export const toInterceptNumber = (number, precision) =>
  Number(intercept(number, precision));

export const toNumberZero = (number) =>
  Number.isNaN(Number(number)) ? 0 : Number(number);

export const handleE8 = (number) => BigNumber(number).div(1e8).toNumber();

export const numberTostring = (number) => {
  if ((!!number || number === 0) && isNumber(number)) {
    return String(number);
  }
  return number;
};

export const toThousandsNumber = (number, precision) => {
  let newNumber = toThousands(number, precision);
  if (!precision) newNumber = newNumber.replace('.', '');
  return newNumber;
};

export const thousandsToNumber = (str) => {
  const number = str.replace(/,/g, '');
  return Number(number);
};

// 默认是向上
export const toThousandsNumberNoZero = (
  number = 0,
  precision,
  direction = BigNumber.ROUND_CEIL,
) => {
  const newNumber = BigNumber(number).toFixed(precision, direction);
  const newNumberNoZero = BigNumber(newNumber).toNumber();
  return BigNumber(newNumberNoZero).toFormat();
};

export const isMobile = () => {
  return navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
  );
};

export const filterObject = (obj, filterFn) => {
  if (typeof obj !== 'object') {
    return obj;
  }
  const newObj = {};
  Object.keys(obj)
    .filter((key) => {
      return filterFn(obj[key]);
    })
    .forEach((key) => {
      newObj[key] = obj[key];
    });
  return newObj;
};

// toNonExponential(12.34) => 12.34
// toNonExponential(1e-8) => 0.00000001
// toNonExponential(-123) => '-123'
// toNonExponential(1.2345e-8) => 0.000000012345
export function toNonExponential(num) {
  if (typeof num === 'number') {
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
  }
  return num;
}

export const getMinus = (p1, p2) => {
  return BigNumber(p1).minus(p2).toNumber();
};

export const getPlus = (p1, p2) => {
  return BigNumber(p1).plus(p2).toNumber();
};

export const getFormatTime = (time) => {
  // 判断是秒级时间戳（10位）还是毫秒级时间戳（13位）
  const timestamp = String(time).length === 10 ? time * 1000 : time;
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

/**
 * 获取数字的小数位数
 * @param {number|string} num - 输入的数字或字符串
 * @returns {number} 小数位数，如果是整数则返回0
 * @example
 * getDecimalPlaces(0.001) // 3
 * getDecimalPlaces(1) // 0
 * getDecimalPlaces('0.001') // 3
 * getDecimalPlaces(1e-3) // 3
 */
export const getDecimalPlaces = (num) => {
  if (num === null || num === undefined) {
    return 0;
  }

  // 转换为字符串处理
  let str = String(num);

  // 处理科学计数法（如 1e-3）
  if (str.includes('e') || str.includes('E')) {
    // 使用已有的 toNonExponential 函数转换为普通小数
    const normalNum = toNonExponential(Number(num));
    str = String(normalNum);
  }

  // 检查是否包含小数点
  if (str.includes('.')) {
    const parts = str.split('.');
    // 返回小数点后的位数
    return parts[1] ? parts[1].length : 0;
  }
  // 如果没有小数点，说明是整数
  return 0;
};

export function getGuestId() {
  let guestId = localStorage.getItem('tv_guest_id');

  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).slice(2)}${Date.now()}`;
    localStorage.setItem('tv_guest_id', guestId);
  }

  return guestId;
}
