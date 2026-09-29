import { sub } from 'common/utils/position';
import { toThousandsNumber } from './utils';

// 计算未结盈亏
export const computedProfitLoss = (
  side: string,
  lastPrice = 1000,
  entryPrice: number,
  qty: number,
) => {
  if (!entryPrice || !qty) {
    return 0;
  }
  return side === 'Buy'
    ? sub(lastPrice, entryPrice) * qty
    : -(sub(lastPrice, entryPrice) * qty);
};

// 计算未结盈亏收利率
export const computedProfitLossPercent = (
  side: string,
  lastPrice = 1000,
  entryPrice: number,
  leverage: number,
) => {
  if (!entryPrice || !leverage) {
    return 0;
  }
  const profitLossPercent =
    side === 'Buy'
      ? (sub(lastPrice, entryPrice) / entryPrice) * leverage * 100
      : -(sub(lastPrice, entryPrice) / entryPrice) * leverage * 100;

  return toThousandsNumber(profitLossPercent, 2);
};
