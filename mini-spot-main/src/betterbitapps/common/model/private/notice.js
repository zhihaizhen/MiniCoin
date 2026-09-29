import { handleX } from 'common/utils/order';
import { toNumberZero } from 'common/utils/utils';

export const notice = (data = {}) => {
  const { side, symbol, type, subQtyX, qtyX, sizeX, symbolAlias } = data;
  return {
    symbol,
    symbolAlias,
    side,
    type,
    qtyX: toNumberZero(qtyX),
    sizeX: toNumberZero(sizeX),
    newLimitE8: toNumberZero(data.newLimitE8),
    newLimit: toNumberZero(data.newLimitE8 / 1e8),
    oldLimitE8: toNumberZero(data.oldLimitE8),
    oldLimit: toNumberZero(data.oldLimitE8 / 1e8),
    marginE8: toNumberZero(data.marginE8),
    margin: toNumberZero(data.marginE8 / 1e8),
    subQtyX: toNumberZero(subQtyX),
    execPrice: toNumberZero(data.execPrice),
    price: toNumberZero(data.price),

    // 仅供正向使用
    qty: handleX(qtyX, symbol),
    size: handleX(sizeX, symbol),
    subQty: handleX(subQtyX, symbol),
  };
};
