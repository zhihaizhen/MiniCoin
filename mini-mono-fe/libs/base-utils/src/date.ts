//  时间处理函数
import _dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import advancedFormat from 'dayjs/plugin/advancedFormat';

_dayjs.extend(utc);
_dayjs.extend(isBetween);
_dayjs.extend(advancedFormat);

export default _dayjs;
export const dayjs = _dayjs;
export const UTC_NOW = dayjs().utc().format('MM/DD HH:mm') + '(UTC)';
export const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
// format example:
// 20221231T235959
export function formatToTTime(time: number): string {
  return fmtDate(time, 'YYYYMMDDTHHmmss');
}

// format example:
// 2022-12-31T23:59:59Z
export function formatToZuluTime(time: number): string {
  return fmtDate(time, 'YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * 格式化时间
 * @param time
 * @param fmt
 * @param isMs 是否是毫秒数据
 */
export function fmtDate(
  time: string | number,
  fmt = 'YYYY-MM-DD HH:mm:ss',
  isMs = true
) {
  if (isMs) {
    const str = dayjs(new Date(+time)).format(fmt);
    return str;
  } else {
    return dayjs(new Date(Number(time) * 1000)).format(fmt);
  }
}

export function getRelativeTime(time: number, isAbbr = false) {
  const ONE_MINUTE = 60 * 1e3;
  const ONE_HOUR = 60 * ONE_MINUTE;
  const ONE_DAY = 24 * ONE_HOUR;

  const getMinutes = (t: number) => Math.ceil(t / ONE_MINUTE);
  const getHours = (t: number) => Math.floor(t / ONE_HOUR);
  const getDays = (t: number) => Math.floor(t / ONE_DAY);

  if (time < ONE_HOUR) {
    const minutes = getMinutes(time);
    return isAbbr ? `${minutes} minute(s)` : `0H ${minutes}M`;
  }

  if (time < ONE_DAY) {
    const minutes = getMinutes(time % ONE_HOUR);
    const hours = getHours(time);
    return isAbbr ? `${hours} hour(s)` : `${hours}H ${minutes}M`;
  }

  const hours = getHours(time % ONE_DAY);
  const days = getDays(time);
  return isAbbr ? `${days} day(s)` : `${days}D ${hours}H`;
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const unixToFormat: (unix: number, format?: string) => string = (
  unix,
  format = DEFAULT_FORMAT
) => {
  return dayjs?.(+unix)?.format(format);
};

export const secondFormat = (time: number) => {
  return dayjs.unix(time)?.format(DEFAULT_FORMAT);
};

export const strToFormat: (str: string, format?: string) => string = (
  str,
  format = DEFAULT_FORMAT
) => {
  return dayjs(str)?.format(format);
};

export const strToFormatUnix: (str: string, format?: string) => string = (
  str,
  format = DEFAULT_FORMAT
) => {
  return dayjs(`${str}Z`)?.utc(true)?.format(format);
};
