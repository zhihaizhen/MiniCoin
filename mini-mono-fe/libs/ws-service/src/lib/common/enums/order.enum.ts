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

export enum ECopyTradingOrderStatus {
  UNKNOWN = 'UNKNOWN',
  PendingNew = 'PendingNew', // 代表此订单被发到trading，还没有被处理，或发送到trading失败
  New = 'New', // 创建成功还没有成交
  OpenOrderPartiallyFilled = 'OpenOrderPartiallyFilled', // 开仓订单部分成交
  OpenOrderFilled = 'OpenOrderFilled', // 开仓订单完全成交
  OpenOrderClosing = 'OpenOrderClosing', // 开仓订单平仓中
  OpenOrderClosedFilled = 'OpenOrderClosedFilled', // 开仓订单完成平仓成功
  CloseOrderPartiallyFilled = 'CloseOrderPartiallyFilled', // 平仓单部分成交
  CloseOrderFilled = 'CloseOrderFilled', // 平仓单完全成交
  Cancelled = 'Cancelled', // 订单被取消
}
