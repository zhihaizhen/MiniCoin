import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(advancedFormat);

export const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const unixToFormat: (
  unix: number | string,
  format?: string
) => string = (unix, format = DEFAULT_FORMAT) => {
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

export default dayjs;
