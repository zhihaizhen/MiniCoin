import { toNumberZero } from '../../../utils/utils';
import { isLinear } from '../../../utils/symbol';

export const order = (data = {}) => {
  const {
    side,
    symbol,
    orderId,
    orderType,
    timeInForce,
    reduceOnly,
    triggerBy,
    stopOrderType,
    expectedDirection,
    orderStatus,
    cxlRejReason,
    isWorking,
    type,
    tpTriggerBy,
    slTriggerBy,
    createType,
    cancelType
  } = data;
  // 正反向字段不一致，后期改造
  let {
    qtyX: qty,
    leavesQtyX: leavesQty,
    cumQtyX: cumExecQty,
    origQtyX: origQty
  } = data;
  if (isLinear(symbol)) {
    qty = toNumberZero(qty) / 1e8;
    leavesQty = toNumberZero(leavesQty) / 1e8;
    cumExecQty = toNumberZero(cumExecQty) / 1e8;
    origQty = toNumberZero(origQty) / 1e8;
  }
  return {
    symbol,
    tpTriggerBy,
    slTriggerBy,
    createType,
    cancelType,
    takeProfit: toNumberZero(data.takeProfit),
    stopLoss: toNumberZero(data.stopLoss),
    orderId,
    side,
    orderType,
    timeInForce,
    reduceOnly,
    stopOrderType,
    triggerBy,
    expectedDirection,
    basePrice: toNumberZero(data.basePrice),
    trailValue: toNumberZero(data.trailValue),
    triggerPrice: toNumberZero(data.triggerPrice),
    price: toNumberZero(data.price),
    qty,
    leavesQty,
    cumExecQty,
    cumExecValue: toNumberZero(data.cumValueE8) / 1e8,
    // cumExecFee: toNumberZero(data.cumExecFeeE8 / 1e8),
    orderStatus,
    cxlRejReason,
    lastExecPrice: toNumberZero(data.lastExecPrice),
    createdAt: toNumberZero(data.createdAtE3),
    updatedAt: toNumberZero(data.updatedAtE3),
    origTriggerPrice: toNumberZero(data.origTriggerPrice),
    origPrice: toNumberZero(data.origPrice),
    origQty,
    isWorking,
    type: type ? type.replace(type[0], type[0].toLowerCase()) : 'unknown'
  };
};
