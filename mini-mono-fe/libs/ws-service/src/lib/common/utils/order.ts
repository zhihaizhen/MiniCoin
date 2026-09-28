import { USER_SETTINGS } from '../packages-biz/by-global-settings';
import { isLinear } from './symbol';
import { toNumberZero } from './utils';

export const hidePreCreateSave = (doubleConfirmData: any) =>
  (doubleConfirmData || '')
    .split(USER_SETTINGS.ORDER_CONFIRM)
    .join('')
    .split(',')
    .filter((val: any) => val);

export const handleX = (val: number, symbol: string) => {
  return isLinear(symbol) ? toNumberZero(val / 1e8) : toNumberZero(val);
};

export const getSymbolConfig = (symbol: string, allSymbolConfig: object) => {
  if (!allSymbolConfig[symbol]) {
    return {};
  }
  const {
    coin,
    symbolName,
    tickSize,
    tickSizeFraction,
    lotSize,
    lotStep,
    lotFraction,
    priceStep,
    minQty,
    maxQty,
    minPrice,
    maxPrice,
    balanceFraction
  } = allSymbolConfig[symbol];
  return {
    coin,
    symbolName,
    tickSize,
    tickSizeFraction,
    lotSize,
    lotStep,
    lotFraction,
    priceStep,
    minQty,
    maxQty,
    minPrice,
    maxPrice,
    balanceFraction
  };
};
