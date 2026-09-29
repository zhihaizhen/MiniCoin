import {
  EOrderSide,
  EOrderStatus,
  EOrderTimeInForce,
  EOrderTradeType,
  EOrderTriggerBy,
  EOrderType,
} from 'common/enums/order.enum';
import { EPositionIdx } from 'common/enums/position.enum';
import { ICommonRespDTO, ICommonRespErrorDTO } from '../api';
import { IOrderListItem } from '../order';
import { IClosedPndItem } from '../position';

interface IOrderCommonCreateReq {
  symbol: string;
  side: EOrderSide;
  orderType: EOrderType;
  timeInForce: EOrderTimeInForce;
  qtyX: String;
  priceE4?: number;
  basePriceE4?: number;
  leverageE2: string; // number;
  takeProfitE4?: number;
  stopLossE4?: number;
  tpTriggerBy: EOrderTriggerBy;
  slTriggerBy: EOrderTriggerBy;
  closeOnTrigger: boolean;
  reduceOnly: boolean;
  positionIdx: number;
  triggerBy: EOrderTriggerBy;
  triggerPriceE4?: number;
  createType?: string;
  type: EOrderTradeType;
  /**
   * 用户自定义的order ID ，由用户自己设置，用来表示order的
   */
  orderLinkId?: string;
  /**
   * 是否已经被交易封禁(只能下减少仓位订单)
   */
  tradingBanned?: boolean;
  /**
   * 代持uid:目前主要是针对mt4相关业务
   */
  holdUid?: number;
  action?: string;
  price: string;
  marketPrice?: string;
  basePrice: string;
  takeProfit: string;
  stopLoss: string;
  triggerPrice: string;
  qtyType?: number;
  qtyTypeValue?: number;
  designatedMarginE8?: string;
}

export interface IOrderPreCreateReq extends IOrderCommonCreateReq {}

export interface IOrderPreCreateRespDTO extends ICommonRespDTO {
  hasPosition: boolean;
  /**
   * 订单价值（反向BTC、ETH、EOS、XRP计价）
   */
  orderValueE8: number;
  takeUpMarginE8: number;
  takeUpMargin: string;
  /**
   *  可用余额
   */
  availableMarginE8: number;
  triggerPriceE4: number;
  markPriceE4: number; // 标记价格
  liqPriceE4: number; // 强平价
  differenceE4: number; // 标记价预期强平价距离（价差）
  positionSizeX: number;
  /**
   *  订单价格
   */
  actualPriceE4: number;
  origQtyX: number;
  actualQtyX: number;
  takeProfitE4: number;
  stopLossE4: number;
  preCreateId: string;

  triggerPrice: string;
  markPrice: string;
  liqPrice: string;
  /**
   * 标记价预期强平价距离（价差）
   */
  difference: string;
  /**
   * 订单价格
   */
  actualPrice: string;
  takeProfit: string;
  stopLoss: string;
}

export interface IOrderCreateReq extends IOrderCommonCreateReq {
  preCreateId?: string;
  coin?: string;
}

export interface IOrderCreateRespDTO extends ICommonRespDTO {
  orderId: string;
  priceE4: number;
  price: string;
}

export interface IOrderCancelReq {
  orderId: string;
  symbol: string;
  type: EOrderTradeType;
}

export interface IOrderCancelRespDTO extends ICommonRespDTO {
  orderId: string;
}

export interface IOrderCancelAllReq {
  symbol: string;
  type: EOrderTradeType;
  positionIdx?: EPositionIdx;
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
  contractType?: string;
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

export interface IGetTpslAllListRespDTO extends ICommonRespDTO {
  tpsl: IOrderListItem[];
}

export interface IGetClosedPnlListReq {
  symbol: string;
}

export interface IGetClosedPnlListRespDTO extends ICommonRespDTO {
  data: IClosedPndItem[];
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
