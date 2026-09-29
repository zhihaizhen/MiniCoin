
import BigNumber from 'bignumber.js';

// 把qty转为qtyx
export const transformWithQtyX = (qty, isInverse) => {
  return isInverse ? qty : BigNumber(qty).multipliedBy(1e8).toString();
};

// 把qtyx转为qty
export const transformWithQty = (qtyX, isInverse) => {
  return isInverse ? qtyX : BigNumber(qtyX).dividedBy(1e8).toString();
};

// spotCoin 正向是BTC 反向是USD  => walletCoin 正向是USDT 反向是BTC
export const transformCcToWc = (qty, price, isInverse) => {
  const newQty = new BigNumber(qty);
  return isInverse ? newQty.dividedBy(price).toNumber() : newQty.multipliedBy(price).toNumber();
};

// walletCoin  将USDT   转为  spotCoin BTC 
export const transformWcToCc = (qty, price, isInverse) => {
  const newQty = new BigNumber(qty);
  return isInverse ? newQty.multipliedBy(price).toNumber() : newQty.dividedBy(price).toNumber();
};
