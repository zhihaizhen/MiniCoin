
import { toThousands } from '@unified/helpers';
import { isApp, getLang } from '@better-bit-fe/base-utils';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

export const decimalFn = (coin = 'BTC') => {
  const fundingWallet = localStorage.getItem('fundingWallet');
  if (fundingWallet) {
    const assets = JSON.parse(fundingWallet);
    return assets?.[coin]?.display_coin_decimal;
  }
  return 4;
};


export const formatNum = (num, coin = 'BTC') => {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(num)) {
    return '--';
  }
  if (num === 0 || num === '-0' || !num) {
    return 0;
  }

  // const [, decimal = 4] = String(num).split('.');
  const decimal = coin === 'fiat' ? 2 : decimalFn(coin);
  const regexp = /(?:\.0*|(\.\d+?)0+)$/; // delete zero at the end
  return toThousands(num, decimal).replace(regexp, '$1');
};

export const formatApr = (num) => {
  if (isNaN(num) || num === undefined || num === null) {
    return '-';
  }
  return `${new BigNumber(num).multipliedBy(100).toString()} %`;
};
export const toThousandsNumberNoZero = (number, precision) => {
  const newNumber = BigNumber(number).toFixed(precision);
  const newNumberNoZero = BigNumber(newNumber).toNumber();
  return BigNumber(newNumberNoZero).toFormat();
};



const getFormat = (time) => {
  return time < 10 ? '0' + time : time;
};

export type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export const countdownFormat = (
  endUnixSeconds: number | undefined | null,
  onTick: (parts: CountdownParts) => void
): (() => void) => {
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const getNowUnixSeconds = () => dayjs().unix();

  const emit = (msRemaining: number) => {
    const days = Math.floor(msRemaining / MS_PER_DAY);
    const hours = Math.floor((msRemaining % MS_PER_DAY) / MS_PER_HOUR);
    const minutes = Math.floor((msRemaining % MS_PER_HOUR) / MS_PER_MINUTE);
    const seconds = Math.floor((msRemaining % MS_PER_MINUTE) / MS_PER_SECOND);

    onTick({
      days: getFormat(days),
      hours: getFormat(hours),
      minutes: getFormat(minutes),
      seconds: getFormat(seconds)
    });
  };

  const emitZeroAndStop = (intervalId?: ReturnType<typeof setInterval>) => {
    if (intervalId) clearInterval(intervalId);
    onTick({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  };

  if (typeof endUnixSeconds !== 'number' || !Number.isFinite(endUnixSeconds)) {
    emitZeroAndStop();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  // eslint-disable-next-line prefer-const
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const update = () => {
    const now = getNowUnixSeconds();
    if (endUnixSeconds <= now) {
      emitZeroAndStop(intervalId);
      return;
    }
    emit((endUnixSeconds - now) * MS_PER_SECOND);
  };

  update(); // 立即触发一次，避免等待 1s 才首次回调
  intervalId = setInterval(update, MS_PER_SECOND);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
};

export const formatBigNumber = (num: number, prefix = '') => {
  if (Math.abs(num) >= 1e12) {
    const result = (num / 1e12).toFixed(2);
    if (Number(result) >= 1000) {
      return `>${prefix}999T`;
    }
    return `${prefix}${result}T`;
  }
  if (Math.abs(num) >= 1e9) {
    return `${prefix}${(num / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(num) >= 1e6) {
    return `${prefix}${(num / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(num) >= 1e3) {
    return `${prefix}${(num / 1e3).toFixed(2)}K`;
  }
  return `${prefix}${toThousands(num).toString()}`;
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

