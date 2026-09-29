import BigNumber from 'bignumber.js';
import { handleX } from 'common/utils/order';
import { toNumberZero } from 'common/utils/utils';

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
    execFeeE8,
    execFeeFromGivenCashE8,
    execFeeFromServiceCashE8,
    totalExecFeeE8,
    closedPnlFromGivenCashE8,
    closedPnlE8,
    totalClosedPnlE8,
    isMaker,
    stopOrderType,
    symbolAlias,
  } = data;

  return {
    ...data,
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
    symbolAlias,
    // 仅正向使用
    qty: handleX(qtyX, symbol),
    leavesQty: handleX(leavesQtyX, symbol),
    execQty: handleX(execQtyX, symbol),
    opponentFrom,
    execFeeE8: toNumberZero(execFeeE8),
    execFee: BigNumber(execFeeE8).dividedBy(1e8),
    execFeeFromGivenCash: BigNumber(execFeeFromGivenCashE8).dividedBy(1e8),
    execFeeFromServiceCash: BigNumber(execFeeFromServiceCashE8).dividedBy(1e8),
    totalExecFee: BigNumber(totalExecFeeE8).dividedBy(1e8),
    closedPnlFromGivenCash: BigNumber(closedPnlFromGivenCashE8).dividedBy(1e8),
    closedPnl: BigNumber(closedPnlE8).dividedBy(1e8),
    totalClosedPnl: BigNumber(totalClosedPnlE8).dividedBy(1e8),
    isMaker,
    stopOrderType,
  };
};
