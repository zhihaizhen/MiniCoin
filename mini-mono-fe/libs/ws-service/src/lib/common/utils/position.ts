import { toThousands } from '@unified/helpers';
import Decimal from 'decimal.js';

import { IPositionItem } from 'common/types/services/position';
import { EOrderSide, ECopyTradingOrderStatus } from 'common/enums/order.enum';
import { IOrderListItemData } from 'common/types/order';
import { IAllSymbolConfig } from 'common/types/symbol';

type TNumberOrString = number | string;

export const calcTradeTypeKey = ({ reduceOnly, side }: IOrderListItemData) => {
  if (!reduceOnly) {
    return side === EOrderSide.Buy ? 'buyLong' : 'sellShort';
  }
  return side === EOrderSide.Buy ? 'closeShort' : 'closeLong';
};

export const getCoin = (symbol: string, allSymbolConfig?: IAllSymbolConfig) => {
  if (allSymbolConfig && allSymbolConfig[symbol]) {
    return allSymbolConfig[symbol].coin;
  }
  return '';
};

export const getBaseCoin = (
  symbol: string,
  allSymbolConfig?: IAllSymbolConfig,
) => {
  if (allSymbolConfig && allSymbolConfig[symbol]) {
    return allSymbolConfig[symbol].baseCoin;
  }
  return '';
};

export const computedFraction = (
  price: number | string,
  symbol: string,
  allSymbolConfig?: IAllSymbolConfig,
  fractionType:
    | 'priceFraction'
    | 'balanceFraction'
    | 'lotFraction'
    | 'tickSizeFraction' = 'tickSizeFraction',
) => {
  if (allSymbolConfig && allSymbolConfig[symbol]) {
    return toThousands(price, allSymbolConfig[symbol][fractionType]);
  }
  return '--';
};

export const displayFractionValue = (
  v: number | string = 0,
  symbol: string,
  allSymbolConfig?: IAllSymbolConfig,
  fractionType:
    | 'balanceFraction'
    | 'lotFraction'
    | 'tickSizeFraction' = 'tickSizeFraction',
) => {
  return `${computedFraction(
    v,
    symbol,
    allSymbolConfig,
    fractionType,
  )} ${getBaseCoin(symbol, allSymbolConfig)}`;
};

export const sub = (...rest: TNumberOrString[]) => {
  let result = new Decimal(rest?.splice(0, 1)[0]);
  rest.forEach((v) => {
    result = new Decimal(result).sub(new Decimal(v));
  });

  return result.toNumber();
};

export const filterPosition = (position: IPositionItem[], symbol: string) =>
  position.filter((v) => v.entryPrice > 0 && (!symbol || symbol === v.symbol));

export const disabledClosePosition = (status: string) => {
  const cannotClosePositionStatus: string[] = [
    ECopyTradingOrderStatus.OpenOrderClosing,
    ECopyTradingOrderStatus.OpenOrderPartiallyFilled,
  ];

  return cannotClosePositionStatus.includes(status);
};
