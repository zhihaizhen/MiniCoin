
import { toThousands } from '@unified/helpers';
import { isApp, getLang } from '@better-bit-fe/base-utils';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { LevelAprProps } from '~/interface';

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
  return `${new BigNumber(num).multipliedBy(100).toString()}%`;
};
export const toThousandsNumberNoZero = (number, precision) => {
  const newNumber = BigNumber(number).toFixed(precision);
  const newNumberNoZero = BigNumber(newNumber).toNumber();
  return BigNumber(newNumberNoZero).toFormat();
};


/**
 * 页面跳转，兼容app 内部跳转
 * @param pageid
 */
// export const goPage = (pageid: string) => {
//    const lang = getLang();
//    const returnPageParam = window.btoa(
//      `${location.origin}/${lang}/earn/savings`
//    );
//   const appPageId = {
//     login: 'loginpage',
//     register: 'register',
//     trade: 'contract/trade?symbol=BTCUSDT',
//     download: 'downloadApp',
//     deposit: 'deposit',
//     withdrawal: 'withdrawal',
//     // transfer: 'transfer', // app 地址确认，暂时不需要
//     // assetsHistory: 'finance/distribute',
//   }
//   const webPageMap = {
//     login: `account/login?return_page=${returnPageParam}`,
//     register: `account/register?return_page=${returnPageParam}`,
//     trade: 'trade/usdt/BTCUSDT',
//     download: 'downloadApp',
//     deposit: 'assets/deposit',
//     withdrawal: 'assets/withdrawal',
//     transfer: 'assets/spotaccount?from=financePage', // 默认打开划转弹框
//     assetsHistory: 'assets/history/funding-transaction',
//     financeAcc: 'assets/earnaccount', // 理财账户
//     financeOrder: 'assets/history/earn-order-history' // 理财订单
//   };
//
//   if (isApp()) {
//     handleGoAppPage(appPageId[pageid], 'earn');
//     return;
//   }
//
//   window.location.href = `${location.origin}/${lang}/${webPageMap[pageid]}`;
// };

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


import { CategoryEnum, TopCategoryEnum } from '~/enums';
import { ProductGroupProps } from '~/interface';

export interface CategoryAprInfo {
  categoryLabel: string;
  aprRangeLabel: string;
}

export const getCategoryAndAprRange = (
  productCollections: ProductGroupProps[] | undefined,
  labels: { fixed: string; liquid: string }
): CategoryAprInfo => {
  const DEFAULT_RESULT: CategoryAprInfo = { categoryLabel: labels.fixed, aprRangeLabel: '-' };

  if (!productCollections?.length) {
    return DEFAULT_RESULT;
  }

  let minApr = Infinity;
  let maxApr = -Infinity;
  const categorySet = new Set<CategoryEnum>();

  productCollections.forEach(({ product_item }) => {
    product_item.forEach((item) => {
      categorySet.add(item.category);

      const aprs: number[] = [];
      if (item.category === CategoryEnum.FIXED) {
        aprs.push(Number(item.fixed_apr));
      } else {
        if (item.top_category === TopCategoryEnum.ONCHAIN) {
          aprs.push(Number(item.min_apr));
          aprs.push(Number(item.max_apr));
        }else {
          // 活期/分级利率：取层级利率的首尾
          const levels = item.level_apr || [];
          if (levels.length > 0) {
            aprs.push(Number(levels[0].apr));
            aprs.push(Number(levels[levels.length - 1].apr));
          }
        }

      }

      aprs.forEach((apr) => {
        if (!isNaN(apr)) {
          minApr = Math.min(minApr, apr);
          maxApr = Math.max(maxApr, apr);
        }
      });
    });
  });

  // 生成分类标签
  const hasLiquid = categorySet.has(CategoryEnum.LIQUID);
  const hasFixed = categorySet.has(CategoryEnum.FIXED);
  const categoryLabel = [hasFixed && labels.fixed, hasLiquid && labels.liquid]
    .filter(Boolean)
    .join(' / ') || labels.fixed;

  // 生成利率范围标签
  const isValidRange = minApr !== Infinity && maxApr !== -Infinity;
  const aprRangeLabel = !isValidRange
    ? '-'
    : minApr === maxApr
      ? formatApr(minApr)
      : `${formatApr(minApr)} ~ ${formatApr(maxApr)}`;

  return { categoryLabel, aprRangeLabel };
};

/**
 * 计算活期理财每日预期收益（阶梯计息）
 * @param amount 申购金额
 * @param levelApr 收益等级配置
 * @returns 每日预期收益
 */
export function calcDailyEarning(amount: number | string | BigNumber, levelApr: LevelAprProps[]): number {
  const amountBN = new BigNumber(amount);
  if (amountBN.lte(0) || !Array.isArray(levelApr)) return 0;

  let remain = amountBN;
  let totalYearEarning = new BigNumber(0);

  for (const level of levelApr) {
    if (remain.lte(0)) break;

    const { min_investment_quota: min, max_investment_quota: max, apr } = level;
    let available: BigNumber;

    // 无上限档
    if (new BigNumber(max).lte(-1)) {
      available = remain;
    } else {
      available = BigNumber.max(0, BigNumber.min(remain, new BigNumber(max).minus(min)));
    }

    if (available.gt(0)) {
      totalYearEarning = totalYearEarning.plus(available.multipliedBy(apr));
      remain = remain.minus(available);
    }
  }

  return totalYearEarning.dividedBy(365).toNumber();
}

// 转换为可计算的 BigNumber，避免接口空值或非法值影响公式计算。
export const toValidBigNumber = (value?: string | number, fallback = 0) => {
  const amount = new BigNumber(value ?? fallback);
  return amount.isFinite() && !amount.isNaN()
    ? amount
    : new BigNumber(fallback);
};

// 规范化输入金额：去除首尾空白与悬挂的小数点，非法输入返回空串。
export const normalizeAmount = (value: string): string => {
  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue === '-' || trimmedValue === '.') return '';

  const safeValue = trimmedValue.endsWith('.')
    ? trimmedValue.slice(0, -1)
    : trimmedValue;
  const amount = new BigNumber(safeValue);
  if (!amount.isFinite() || amount.isNaN()) return '';

  return amount.toFixed();
};

// 格式化展示金额：非法值返回 '-'；指定精度时向下截断，否则按千分位展示。
export const formatAmount = (value?: string | number, decimals?: number) => {
  if (value === undefined || value === null || value === '') return '-';

  const amount = new BigNumber(value);
  if (!amount.isFinite()) return '-';

  return decimals
    ? amount.decimalPlaces(decimals, BigNumber.ROUND_DOWN).toString()
    : amount.toFormat();
};

// 将利率换算为百分比数值（乘以 100），非法值返回 fallback。
export const formatRateToPercent = (value?: string | number, fallback = 0): number => {
  const amount = new BigNumber(value || fallback);
  if (!amount.isFinite() || amount.isNaN()) return fallback;
  return amount.times(100).toNumber();
};
