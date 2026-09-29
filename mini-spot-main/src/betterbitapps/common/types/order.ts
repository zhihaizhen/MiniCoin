import {
  EOrderSide,
  EOrderStatus,
  EOrderTimeInForce,
  EOrderTradeType,
  EOrderTriggerBy,
  EOrderType,
} from 'common/enums/order.enum';
import { EPositionIdx } from 'common/enums/position.enum';


type Cost2Qty = {
  long: number | undefined;
  short: number | undefined;
};
export interface IOrderInfo {
  price: string | undefined;
  triggerPrice: string | undefined;
  orderType: EOrderType;
  qty: number | undefined;
  cost?: number | undefined; // 成本
  cost2qty?: Cost2Qty; // 成本计算后的数量
  leverageE2: number;
  takeProfit: string;
  stopLoss: string;
  tpTriggerBy: EOrderTriggerBy;
  slTriggerBy: EOrderTriggerBy;
  triggerBy: EOrderTriggerBy;
  reduceOnly: boolean;
  closeOnTrigger: boolean;
  timeInForce: EOrderTimeInForce;
  preCreateId?: string;
  type: string;
  side: EOrderSide;
}

export interface IPreOrder {
  orderType: EOrderType;
  price: string | undefined;
  takeUpMargin: string | undefined;
  liqPrice: string | undefined;
  qty: string | undefined;
  origQty?: string | undefined; // 预下单展示qty ，用来展示用
  takeProfit: string | undefined;
  stopLoss: string | undefined;
  leverage: number | undefined;
  preCreateId?: string;
  value: number;
}

export interface IImmerOrder {
  [x: string]: string | number | boolean | undefined | Cost2Qty;
}

export interface IOrderCost {
  longCost: number | undefined;
  shortCost: number | undefined;
}

export interface IOrderBuySLTPRefObject {
  readonly showTP: boolean;
  toggleTPPanel: (v: boolean) => void;
  readonly showSL: boolean;
  toggleSLPanel: (v: boolean) => void;
  reset?: () => void;
}

export interface IOrderListItem {
  data: IOrderListItemData;
  isAvailable: boolean;
}

export interface IOrderListItemData {
  id: number;
  userId: number;
  symbol: string;
  createType: string;
  cancelType: string;
  tpTriggerBy: EOrderTriggerBy;
  slTriggerBy: EOrderTriggerBy;
  takeProfitE4: number;
  takeProfit: string;
  stopLossE4: number;
  stopLoss: string;
  orderId: string;
  side: EOrderSide;
  orderType: EOrderType;
  timeInForce: EOrderTimeInForce;
  reduceOnly: boolean;
  /**
   * 条件单类型
   */
  stopOrderType: string;
  triggerBy: EOrderType;
  /**
   * 条件单预期涨/跌方向
   */
  ExpectedDirection: string;
  basePriceE4: number;
  /**
   *  条件单基准价格 (追踪止盈时存储activation_price)
   */
  basePrice: string;
  trailValueE4: number;
  /**
   * 追踪点差
   */
  trailValue: string;
  triggerPriceE4: number;
  /**
   * 条件单触发价格
   */
  triggerPrice: string;
  priceE4: number;
  /**
   * 订单价格
   */
  price: string;
  /**
   * 订单数量
   */
  qtyX: number;
  /**
   * 订单剩余数量
   */
  leavesQtyX: number;
  /**
   * 订单累计成交数量
   */
  cumQtyX: number;
  // 订单累计成交价值
  cumValueE8: number;
  // 本订单累计交易手续费(taker,maker抵消累加)
  cumExecFeeE8: number;
  /**
   * 订单状态
   */
  orderStatus: EOrderStatus;
  // 撮合拒单原因
  cxlRejReason: string;
  // 订单最近一笔成交价格
  lastExecPriceE4: number;
  /**
   * 订单最近一笔成交价格
   */
  lastExecPrice: string;
  /**
   * 订单创建时间
   */
  createdAtE3: number;
  /**
   * 订单更新时间
   */
  updatedAtE3: number;
  origTriggerPriceE4: number;
  /**
   * (本次是ReplaceOrder触发的推送) 原触发价格
   */
  origTriggerPrice: string;
  origPriceE4: number;
  /**
   * (本次是ReplaceOrder触发的推送) 原订单价格
   */
  origPrice: string;
  /**
   * (本次是ReplaceOrder触发的推送) 原订单数量
   */
  origQtyX: number;
  /**
   * 跟踪标识
   */
  clientFlag: string;
  /**
   * 订单是否属于`有效状态`
   */
  isWorking: boolean;
  type: EOrderTradeType;
  positionIdx: EPositionIdx;
}

export interface IWsOrderItem {
  userId: string;
  parentUserId: string;
  orderId: string;
  coin: string;
  symbol: string;
  orderType: string;
  price: string;
  entryPrice: number;
  leverage: number;
  qty: number;
  timeInForce: string;
  createType: string;
  leavesQty: number;
  reduceOnly: string;
  stopOrderType: string;
  takeProfit: string;
  stopLoss: string;
  basePrice: string;
  side: 'Buy' | 'Sell';
  status: string;
  positionIdx: string;
  leaderUserId: string;
  createdAt: number;
  updatedAt: number;
}

export interface IApiOrderItem {
  symbol: string;
  entryPrice: number;
  closedPrice?: number;
  qty: number;
  createdAtE3: number;
  orderId: string;
  side: 'Buy' | 'Sell';
  leverage: number;
  cumExecOrderCost: string;
  isIsolated: boolean;
  cumExecFee: number;
  status: string;
  leaderUserId: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  positionIdx: string;
  leavesQty: number;
  orderType: string;
  price: number;
  transactTimeE3: number;
  tpTriggerBy: string;
  slTriggerBy: string;
  takeProfit: number | undefined;
  stopLoss: number | undefined;
  buyValueToCost?: number;
  sellValueToCost?: number;
  takeProfitOrderId: string;
  stopLossOrderId: string;
  reCalcEntryPrice: string | number;
  size: string | number;
}

// 合并了ws api类型
export interface IOrderItem extends IApiOrderItem {}
