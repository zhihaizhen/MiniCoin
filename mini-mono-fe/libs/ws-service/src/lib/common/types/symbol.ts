export interface IAllSymbolConfig {
  [key: string]: ISymbolConfig;
}
export interface ISymbolConfig {
  avatarUrl: {
    dark: string;
    light: string;
  };
  maintainMargin: number;
  balanceFraction: number;
  baseCoin: string;
  coin: string;
  lotFraction: number;
  lotStep: number;
  maxPrice: number;
  maxQty: number;
  minPrice: number;
  minQty: number;
  priceStep: number;
  priceFraction: number;
  symbol: string;
  tickSizeFraction: number;
  lotSize: number;
}

export interface IPublicInfoItem {
  indexPrice: number;
  lastPrice: number;
  markPrice: number;
  symbol: string;
}

export interface IAllSymbolListItemDTO {
  symbol: string;
  maxLeverageE2: number;
  minLeverageE2: number;
  maxDesignatedMarginE8: number;
  minDesignatedMarginE8: number;
  riskMinLeverageE2: number;
  riskMaxLeverageE2: number;
}

export interface IAllSymbolListRespDTO {
  data: IAllSymbolListItemDTO[];
}
