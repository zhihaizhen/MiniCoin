import { numberTostring } from 'common/utils/utils';

export const replacePost = (data = {}) => {
  const { price, triggerPrice, takeProfit, stopLoss, ...others } = data;
  return {
    ...others,
    price: numberTostring(price),
    triggerPrice: numberTostring(triggerPrice),
    takeProfit: numberTostring(takeProfit),
    stopLoss: numberTostring(stopLoss),
  };
};
