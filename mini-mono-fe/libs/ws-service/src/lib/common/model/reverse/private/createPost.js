import { numberTostring } from '../../../utils/utils';
import { omit } from '@unified/helpers';

export const createPost = (data = {}) => {
  const { price, basePrice, triggerPrice, takeProfit, stopLoss, ...others } =
    omit(
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
    stopLoss: numberTostring(stopLoss)
  };
};
