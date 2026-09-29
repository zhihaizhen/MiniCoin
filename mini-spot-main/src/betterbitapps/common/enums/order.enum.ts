export enum EDirectionText {
  Long = 'long',
  Short = 'short',
}

export enum EOrderType {
  Limit = 'Limit',
  Market = 'Market',
  Condition = 'Conditions',
}

// 新增成本下单类型
// 0 老版本，1数量，2百分百 3成本下单
// 目前传3只有在 市价单情况下传
export enum EQtyType {
  Qty = 'Qty',
  Cost = 'Cost',
}

export enum EOrderSLTP {
  SL = 'sl',
  TP = 'tp',
}

export enum EOrderSide {
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum EOrderTimeInForce {
  GoodTillCancel = 'GoodTillCancel',
  ImmediateOrCancel = 'ImmediateOrCancel',
  FillOrKill = 'FillOrKill',
  PostOnly = 'PostOnly',
}

export enum EOrderTriggerBy {
  MarkPrice = 'MarkPrice',
  MarketPrice = 'LastPrice',
  IndexPrice = 'IndexPrice',
}

// 条件单/活动单类型
export enum EOrderTradeType {
  Activity = 'Activity',
  Conditions = 'Conditions',
}

export enum EOrderStatus {
  Unknown = 0,
  NotActive = 1,
  Untriggered = 2,
  Active = 3,
  Created = 4,
  Rejected = 5,
  New = 6,
  Cancelled = 7,
  PartiallyFilled = 8,
  Filled = 9,
  Deactivated = 10,
}


