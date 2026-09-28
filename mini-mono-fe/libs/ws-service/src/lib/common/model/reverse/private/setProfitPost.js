import { numberTostring } from '../../../utils/utils';

export const setProfitPost = (data = {}) => {
  const { trailingStop, activationPrice, takeProfit, stopLoss, ...others } =
    data;
  return {
    ...others,
    trailingStop: numberTostring(trailingStop),
    activationPrice: numberTostring(activationPrice),
    takeProfit: numberTostring(takeProfit),
    stopLoss: numberTostring(stopLoss)
  };
};
