import { numberTostring } from '../../../utils/utils';

export const preCreatePost = (data = {}) => {
  const { price, basePrice, triggerPrice, takeProfit, stopLoss, ...others } =
    data;
  return {
    ...others,
    triggerPrice: numberTostring(triggerPrice),
    price: numberTostring(price),
    basePrice: numberTostring(basePrice),
    takeProfit: numberTostring(takeProfit),
    stopLoss: numberTostring(stopLoss)
  };
};
