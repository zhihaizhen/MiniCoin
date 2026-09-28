export interface IApiPositionItem {
  id: string;
  userId: string;
  coin: string;
  symbol: string;
  positionIdx: string;
  mode: string;
  riskId: string;
  leverage: number;
  isIsolated: string;
  side: string;
  size: number;
  unrealisedPnl: number;
  liqPrice: string;
  bustPrice: string;
  value: number;
  buyValueToCost: number;
  sellValueToCost: number;
  priceScale: string;
  entryPrice: number;
  minPositionCost: number;
  positionBalance: number;
  positionMargin: number;
  createdAtE3: number;
  updatedAtE3: number;
  transactTimeE3: number;
  status: string;
  reCalcEntryPrice: number;
}

export interface IPositionInfoItem {
  symbol: string;
  positionIdx: string;
  side: 'Buy' | 'Sell';
  buyValueToCost: number;
  sellValueToCost: number;
}
export interface IWsPositionItem {
  userId: string;
  parentUserId: string;
  coin: string;
  symbol: string;
  positionIdx: string;
  mode: string;
  riskId: string;
  leverage: number;
  isIsolated: boolean;
  side: string;
  size: number;
  unrealisedPnl: number;
  liqPrice: string;
  bustPrice: string;
  value: number;
  buyValueToCost: number;
  sellValueToCost: number;
  priceScale: string;
  entryPrice: string;
  minPositionCost: number;
  positionBalance: number;
  positionMargin: number;
  createdAt: number;
  updatedAt: number;
  reCalcEntryPrice: string;
}

export interface ICommonPageListParams {
  page: number;
  pageSize: number;
}

export interface IPositionTradeDetailReq {
  account_id?: number;

}

// 计划委托列表查询（当前/历史 open_orders、history_orders 共用）
export interface IPlanOrderListReq {
  symbol_id?: string; // 交易对过滤
  limit?: number; // 返回条数，默认 100，最大 1000
  from_plan_order_id?: number; // 查询大于该 ID 的数据
  end_plan_order_id?: number; // 查询小于该 ID 的数据
  plan_type?: 'NORMAL' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'PROFIT_OR_STOP'; // 可选；不传则返回 NORMAL+PROFIT_OR_STOP 合集
  type?: 'LIMIT' | 'MARKET'; // 订单类型
  start_time?: number; // 委托开始时间戳（毫秒级）
  end_time?: number; // 委托结束时间戳（毫秒级）
}

