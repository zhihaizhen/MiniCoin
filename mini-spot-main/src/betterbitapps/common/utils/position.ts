import { toThousands } from '@unified/helpers';
import Decimal from 'decimal.js';
import { IAllSymbolConfig } from 'common/types/symbol';

type TNumberOrString = number | string;



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
    return toThousands(price, allSymbolConfig[symbol]?.[fractionType]);
  }
  return '--';
};



export const sub = (...rest: TNumberOrString[]) => {
  let result = new Decimal(rest?.splice(0, 1)[0]);
  rest.forEach((v) => {
    result = new Decimal(result).sub(new Decimal(v));
  });

  return result.toNumber();
};

