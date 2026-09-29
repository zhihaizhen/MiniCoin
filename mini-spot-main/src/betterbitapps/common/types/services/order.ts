import {
  EOrderSide,
  EOrderStatus,
  EOrderTriggerBy,
  EOrderType,
} from 'common/enums/order.enum';
import { ICommonRespDTO, ICommonRespErrorDTO } from '../api';
import { IOrderListItem } from '../order';

export interface IOrderCreateReq  {
  type?: string; // limit, market
  side?: string; // BUY, SELL
  price?: string; 
  quantity?: string;  // 单位是coin
  symbol_id?: number; //
  client_order_id?: number; // 时间戳
  exchange_id?: number; // 市价才有这个字段 如301
  symbol_name?: string; // 币对名称，市价才有这个字段 如BTC

  // 止盈止损（后端已支持）：止盈/止损触发价；>0 时成交后自动创建对应计划委托
  profit_price?: string;
  stop_price?: string;
  // TODO(后端未支持)：止盈/止损委托类型与委托价，待后端扩展确认字段名后生效
  profit_type?: string; // LIMIT / MARKET
  profit_order_price?: string;
  stop_type?: string; // LIMIT / MARKET
  stop_order_price?: string;
}

// 现货计划委托创建入参（POST /spot/private/v1/plan_order/create）
export interface IPlanOrderCreateReq {
  symbol_id?: string; // 交易对ID，如 BTCUSDT
  client_plan_id?: string; // 客户端幂等ID，最长 64
  trigger_price?: string; // 触发价，必须大于 0
  side?: string; // BUY / SELL
  plan_type?: string; // NORMAL
  type?: string; // 触发后下单类型：LIMIT / MARKET
  price?: string; // 触发后限价单价格；市价单不传
  quantity?: string; // 触发后下单数量
  expire_time?: number; // 毫秒级过期时间戳；不传表示不过期
  // 止盈止损（后端已支持）
  profit_price?: string;
  stop_price?: string;
  // TODO(后端未支持)：止盈/止损委托类型与委托价，待后端扩展确认字段名后生效
  profit_type?: string;
  profit_order_price?: string;
  stop_type?: string;
  stop_order_price?: string;
}
export interface IOrderCreateRespDTO extends ICommonRespDTO {
  orderId: string;
  priceE4: number;
  price: string;
}

// 现货计划委托撤单入参（POST /spot/private/v1/plan_order/cancel）
export interface IPlanOrderCancelReq {
  plan_order_id: string;
  account_id?: number;
}
export interface IOrderCancelReq {
  client_order_id: number;
  account_id: number;
  order_id: string;
  i:number
}

export interface IOrderCancelRespDTO extends ICommonRespDTO {
  orderId: string;
}

export interface IOrderCancelAllRespDTO extends ICommonRespDTO {
  orderIds: string[];
}

export interface IOrderListReq {
  symbol: string;
  orderListType: string; // activity,latest,conditions
  orderType?: EOrderType;
  side?: EOrderSide;
  OrderClassification?: EOrderTriggerBy;
  orderId?: string;
  OrderLinkId?: string;
  orderStatus?: EOrderStatus;
}

export interface IOrderListRespDTO extends ICommonRespDTO {
  activity: IOrderListItem[];
  conditions: IOrderListItem[];
  history: IOrderListItem[];
  tpsl: IOrderListItem[];
  normalConditions: IOrderListItem[];
}

export interface IReplaceOrderReq {
  symbol: string;
  orderId: string;
  orderLinkId?: string;
  priceE4?: number;
  qtyX?: String;
  /**
   * 修改目标触发价格
   */
  triggerPriceE4: number;
  type: EOrderTriggerBy;
  // 部分止盈止损增加字段
  tpTriggerBy?: EOrderTriggerBy;
  takeProfitE4?: number;
  slTriggerBy?: EOrderTriggerBy;
  stopLossE4?: number;
  triggerBy?: EOrderTriggerBy;
  price?: string;
  triggerPrice?: string;
  takeProfit?: string;
  stopLoss?: string;
}

export interface IReplaceOrderRespDTO extends ICommonRespDTO {
  orderId: string;
  priceE4: number;
  price: string;
}


export interface ICreateOrderErrorResultDto {
  create_order_failed_qty_x: number;
}

export interface ICreateOrderErrorDto {
  code?: number;
  result: ICreateOrderErrorResultDto;
}

export interface ICreateOrderErrorResp extends ICommonRespErrorDTO {
  data: ICreateOrderErrorDto;
}

export interface IHandleCreateOrderCatchDto extends IOrderCreateReq {
  serviceType?: string;
}

export interface ICreateCopyTradingPreOrderParams {
  basePrice?: string;
  leverage: number;
  orderType: string;
  positionIdx: string;
  price: string;
  qtyX: number;
  side: string;
  symbol: string;
  timeInForce: string;
  type?: string;
  qtyType?: number;
  qtyTypeValue?: number;
  takeProfit?: number;
  stopLoss?: number;
  tpTriggerBy?: string;
  slTriggerBy?: string;
  coin?: string;
}

export interface IPreCopyTradingOrder {
  preCreateId: string;
  actualPrice: number;
  orderValue: number;
  liqPrice: number;
  takeUpMargin: number;
  hasError?: boolean;
  orderValueE8?: string;
  takeUpMarginE8?: string;
}

export interface ICreateCopyTradingOrderParams
  extends ICreateCopyTradingPreOrderParams {
  preCreateId: string;
}

export interface ICopyTradingOrder {
  orderId: string;
  price: string;
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
}

export interface IApiOrderItemDTO {
  symbol: string;
  entryPrice: string;
  qtyX: string;
  createdAtE3: string;
  orderId: string;
  side: 'Buy' | 'Sell';
  leverageE2: string;
  cumExecOrderCost: string;
  isIsolated: boolean;
  cumExecFeeE8: string;
  status: string;
  leaderUserId: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  positionIdx: string;
  leavesQtyX: string;
  orderType: string;
  price: string;
  transactTimeE3: string;
  tpTriggerBy: string;
  slTriggerBy: string;
  takeProfit: string;
  stopLoss: string;
  buyValueToCostE8: string;
  sellValueToCostE8: string;
  takeProfitOrderId: string;
  stopLossOrderId: string;
  orderCostE8: string; // 订单成本
  sizeX: string; // 当前持仓size
}

/**
 * 取消订单(copyTrading)
 */
export interface ICancelOrderParams {
  orderId?: string;
  symbol?: string;
}

export interface ITradeCurrentListQuery {
  symbol?: string;
  leaderId?: string;
  leaderUserId?: string;
  type?: string; // 区分 明细 汇总
}

export interface IApiOrderItemListDTO {
  data: IApiOrderItemDTO[];
}

export interface IOrderRespDTO {
  hasError?: any;
  orderId: string;
  price: string;
}

export interface IWsCopyTradeExecutionItemDTO {
  userId: string;
  parentUserId: string;
  leaderUserId: string;
  orderId: string;
  orderType: string;
  coin: string;
  symbol: string;
  side: string;
  execId: string;
  execPrice: string;
  execQtyX: string;
  execType: string;
  execLeverageE2: string;
}

export interface IWsCopyTradeExecutionItem {
  userId: string;
  parentUserId: string;
  leaderUserId: string;
  orderId: string;
  orderType: string;
  coin: string;
  symbol: string;
  side: string;
  execId: string;
  execPrice: string;
  execQty: string;
  execType: string;
  execLeverage: string;
}

/**
 * 止盈止损
 */
export interface ISetTpSlTsParams {
  symbol: string;
  takeProfit: string;
  stopLoss: string;
  tpTriggerBy: string;
  slTriggerBy: string;
  orderId: string;
}

export interface ILeverageItem {
  symbol: string;
  leverage: number;
  bv2c?: number;
  sv2c?: number;
}

export interface IGetLeverageConfigRespDTO {
  data: ILeverageConfigItemDTO[];
}
export interface ILeverageConfigItemDTO {
  symbol: string;
  leverageE2: string;
  buyValueToCostE8: number;
  sellValueToCostE8: number;
}

export interface ILeverageSetReqParams {
  symbol: string;
  leverageE2: string;
}
