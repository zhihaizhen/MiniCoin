import { toNumberZero } from '../../../utils/utils';
import { isLinear } from '../../../utils/symbol';

export const execution = (data = {}) => {
  const {
    symbol,
    orderId,
    side,
    orderType,
    reduceOnly,
    execType,
    execId,
    opponentFrom
  } = data;
  // 正反向字段不一致，后期改造
  let { qtyX: qty, leavesQtyX: leavesQty, execQtyX: execQty } = data;
  if (isLinear(symbol)) {
    qty = toNumberZero(qty) / 1e8;
    leavesQty = toNumberZero(leavesQty) / 1e8;
    execQty = toNumberZero(execQty) / 1e8;
  }
  return {
    symbol,
    price: toNumberZero(data.price),
    orderId,
    side,
    orderType,
    reduceOnly,
    qty,
    leavesQty,
    execTime: toNumberZero(data.execTimeE3),
    execType,
    execId,
    execPrice: toNumberZero(data.execPrice),
    execQty,
    opponentFrom
  };
};
