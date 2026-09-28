import { EOrderTriggerBy } from 'common/enums/order.enum';
import { IPositionListItem, IRiskLimitListItem } from '../position';

export interface IPositionListReq {
  symbol?: string;
}

export interface IPositionListRespDTO {
  list: IPositionListItem[];
}

export interface ISetAutoAddMarginReq {
  symbol: string;
  positionIdx: number;
  newAutoAddMargin: string;
}

export interface ISetMarginReq {
  symbol: string;
  positionIdx: number;
  positionBalanceE8: number;
  positionMarginE8: number;
}

export interface IAddMarginReq {
  symbol: string;
  positionIdx: number;
  addToPositionBalanceE8: number;
}

export interface ISetLeverageReq {
  symbol: string;
  buyLeverageE2: number;
  sellLeverageE2: number;
  positionIdx: number;
  skipSwitchIsolated: boolean;
}

export interface ISwitchIsolatedReq {
  symbol: string;
  positionIdx: number;
  newIsolated?: boolean;
  newBuyLeverageE2: number;
  newSellLeverageE2: number;
  crossWithNewLeverage: boolean;
}

export interface ISetTpSlTsReq {
  symbol: string;
  positionIdx: number;
  tpTriggerBy: EOrderTriggerBy;
  takeProfitE4?: number;
  slTriggerBy: EOrderTriggerBy;
  stopLossE4?: number;
  tsTriggerBy: EOrderTriggerBy;
  trailingStopE4?: number;
  tpSizeX: number;
  slSizeX: number;
  stopLoss: number;
  takeProfit: string;
  tpStopOrderId: string;
  slStopOrderId: string;
  trailingStop: string;
  activationPrice: string;
}

export interface ISetRiskLimitReq {
  symbol: string;
  positionIdx: number;
  riskId: number;
}

export interface ISwitchTpSlModeReq {
  symbol: string;
  tpSlMode: string;
}

export interface ISwitchPositionModeReq {
  symbol: string;
  mode: string;
}

export interface IGetRiskLimitListReq {
  symbol: string;
}

export interface IGetRiskLimitListRespDTO {
  list: IRiskLimitListItem[];
}

export interface IApiPositionItemDTO {
  id: string;
  userId: string;
  coin: string; // 结算币种
  symbol: string;
  positionIdx: string; // 0~单向持仓 1~双向持仓Buy 2~双向持仓Sell
  mode: string; // 持仓模式
  riskId: string; // 当前选定的风险限额等级
  leverageE2: string; // 用户设置的杠杆 (全仓时设置为当前风险限额最大杠杆)
  isIsolated: string; // 是否为逐仓模式 (默认值: false表示全仓)
  side: string; // 当前持仓的方向
  sizeX: string; // 当前持仓size
  unrealisedPnlE8: string; // 取市场价和最优对手价就算出来的盈亏 取最小值
  liqPrice: string; // 持仓强平价
  bustPrice: string; // 持仓破产价
  valueE8: string; // 持仓价值
  buyValueToCostE8: string; // Buy方向下单成本转化系数
  sellValueToCostE8: string; // Sell方向下单成本转化系数
  priceScale: string; // 价格精度
  entryPrice: string;
  minPositionCostE8: string;
  positionBalanceE8: string; // 逐:初始锁定or额外追加 全:自动借调 用于cover持仓的真钱
  positionMarginE8: string; // 有效保证金, 极端情况下可能为负数
  createdAtE3: string;
  updatedAtE3: string;
  transactTimeE3: string;
  status: string;
  reCalcEntryPrice: string;
}

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

export interface IPositionInfoItemDTO {
  symbol: string;
  positionIdx: string;
  side: 'Buy' | 'Sell';
  buyValueToCostE8: string;
  sellValueToCostE8: string;
}

export interface IPositionInfoItem {
  symbol: string;
  positionIdx: string;
  side: 'Buy' | 'Sell';
  buyValueToCost: number;
  sellValueToCost: number;
}

export interface IPositionInfoDTO {
  data: IPositionInfoItemDTO[];
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

export interface IPositionItem extends IApiPositionItem {}

export interface ILeaderHistoryListItemDTO {
  orderId: string;
  symbol: string;
  side: string;
  isIsolated: string;
  leverageE2: string;
  entryPrice: string;
  closedPrice: string;
  size: string;
  closedPnlE8: string;
  startedTimeE3: string;
  closedTimeE3: string;
  fundingFeeE8: string;
  closeCumExecFeeE8: string;
  openCumExecFeeE8: string;
  closedType: string;
  orderCostE8: number;
  followerNum: number;
}
export interface ICommonPageListParams {
  page: number;
  pageSize: number;
}

export interface IGetLeaderHistoryListParams extends ICommonPageListParams {
  symbol: string;
  sort?: number;
  leaderId?: string;
  leaderUserId?: string;
  leaderMark?: string;
}

export interface ILeaderHistoryListDTO {
  data: ILeaderHistoryListItemDTO[];
  currentPage: string;
  totalCount: string;
}

export interface ILeaderHistoryListItem {
  orderId: string;
  symbol: string;
  side: string;
  isIsolated: string;
  leverage: number;
  entryPrice: number;
  closedPrice: number;
  size: number;
  closedPnl: number;
  startedTimeE3: number;
  closedTimeE3: number;
  fundingFee: number;
  closeCumExecFee: number;
  openCumExecFee: number;
  closedType: number;
  orderCost: number;
  followerNum: number;
}

export interface IApiPositionListDTO {
  data: IApiPositionItemDTO[];
}
