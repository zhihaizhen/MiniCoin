import { toNumberZero } from '../../../utils/utils';
import { isLinear } from '../../../utils/symbol';

export const notice = (data = {}) => {
  const { side, symbol, type } = data;
  // 正反向字段不一致，后期改造
  let { qtyX: qty, sizeX: size, subQtyX: subQty } = data;
  if (isLinear(symbol)) {
    qty = toNumberZero(qty) / 1e8;
    size = toNumberZero(size) / 1e8;
    subQty = toNumberZero(subQty) / 1e8;
  }
  return {
    symbol,
    side,
    type,
    qty,
    size,
    newLimit: toNumberZero(data.newLimitE8) / 1e8,
    oldLimit: toNumberZero(data.oldLimitE8) / 1e8,
    margin: toNumberZero(data.marginE8) / 1e8,
    subQty,
    price: toNumberZero(data.price)
  };
};
