export interface ICurSymbolConfig {
  tickSizeFraction: number;
  balanceFraction: number;
}

export interface IUseSymbolConfigResult {
  curSymbolConfig: ICurSymbolConfig;
}

export interface IOrderbookMeta {
  bid1Price: number;
  ask1Price: number;
}

export interface IUseOrderbookStreamResult {
  orderbookMeta: IOrderbookMeta;
}

export interface ILongPoz {
  bv2c: number;
  riskId: number;
}

export interface IShortPoz {
  sv2c: number;
  riskId: number;
}

export interface IUsePositionStoreResult {
  longPoz: ILongPoz;
  shortPoz: IShortPoz;
  mode: string;
}
