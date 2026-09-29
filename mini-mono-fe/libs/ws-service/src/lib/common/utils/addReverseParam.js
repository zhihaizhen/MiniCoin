import { omit } from '@unified/helpers';

export const addReverseParams = (params) => {
  return omit(params, [
    'triggerPrice',
    'takeProfit',
    'stopLoss',
    'price',
    'basePrice',
    'liqPrice',
    'actualPrice',
    'markPrice',
    'difference',
  ]);
};
