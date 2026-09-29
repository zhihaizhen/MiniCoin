export enum EPositionIdx {
  Single = '0',
  Doublebuy = '1',
  Doublesell = '2',
}

export enum EPositionMode {
  Single = 'MergedSingle',
  Double = 'BothSide',
}

export enum EPositionSide {
  None = 'None',
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum ETpSlMode {
  /**
   * 锚定仓位的全量止盈止损模式
   */
  Full = 'Full',
  /**
   * 部分止盈止损
   */
  Partial = 'Partial',
}

export enum ESymbolDetailSwitch {
  details = 'details',
  summary = 'summary',
}
