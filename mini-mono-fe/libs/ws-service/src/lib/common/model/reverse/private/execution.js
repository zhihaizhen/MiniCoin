import { handleX } from '../../../utils/order';
import { toNumberZero } from '../../../utils/utils';

export const execution = (data = {}) => {
  const {
    symbol,
    orderId,
    side,
    orderType,
    reduceOnly,
    execType,
    execId,
    qtyX,
    leavesQtyX,
    execQtyX,
    opponentFrom,
    execFeeE8
  } = data;

  return {
    symbol,
    price: toNumberZero(data.price),
    orderId,
    side,
    orderType,
    reduceOnly,
    qtyX: toNumberZero(qtyX),
    leavesQtyX: toNumberZero(leavesQtyX),
    execTimeE3: toNumberZero(data.execTimeE3),
    execType,
    execId,
    execPrice: toNumberZero(data.execPrice),
    execQtyX: toNumberZero(execQtyX),
    // 仅正向使用
    qty: handleX(qtyX, symbol),
    leavesQty: handleX(leavesQtyX, symbol),
    execQty: handleX(execQtyX, symbol),
    opponentFrom,
    execFeeE8: toNumberZero(execFeeE8),
    execFee: toNumberZero(execFeeE8 * 1e-8)
  };
};
