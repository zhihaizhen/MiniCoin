import { numberTostring, toNumberZero } from '../../../utils/utils';
import { omit } from '@unified/helpers';

export const closedPnl = (data = {}) => {
  const {
    price,
    basePrice,
    avgEntryPrice,
    avgExitPrice,
    orderPrice,
    triggerPrice,
    takeProfit,
    stopLoss,
    cumClosedPnlE8,
    cumClosedSizeX,
    updatedAtE3,
    ...others
  } = omit(
    data,
    'liqPriceE4',
    'actualPriceE4',
    'triggerPriceE4',
    'takeProfitE4',
    'stopLossE4'
  );
  return {
    ...others,
    triggerPrice: numberTostring(triggerPrice),
    price: numberTostring(price),
    basePrice: numberTostring(basePrice),
    takeProfit: numberTostring(takeProfit),
    stopLoss: numberTostring(stopLoss),
    avgEntryPrice: toNumberZero(avgEntryPrice),
    avgExitPrice: toNumberZero(avgExitPrice),
    orderPrice: toNumberZero(orderPrice),
    closedPnl: toNumberZero(cumClosedPnlE8 / 1e8),
    updatedAtE3: toNumberZero(updatedAtE3),
    cumClosedSizeX,
    // 仅正向使用
    closedSize: toNumberZero(cumClosedSizeX / 1e8)
  };
};
