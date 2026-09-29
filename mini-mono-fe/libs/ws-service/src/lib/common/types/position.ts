import { EOrderSide, EOrderTriggerBy } from 'common/enums/order.enum';
import {
  EPositionIdx,
  EPositionMode,
  EPositionSide,
  ETpSlMode,
} from 'common/enums/position.enum';

export interface IPositionListItem {
  data: IPositionListItemData;
  isAvailable: boolean;
}

export interface IRiskLimitListItem {
  id: string;
  symbol: string;
  limit: string;
  startingMarginE8: string;
  maintainMarginE8: string;
  isLowestRisk: boolean;
  section: string[];
  contractType: string;
  symbolName: string;
  maxLeverageE2: string;
}

export interface IPositionListItemData {
  userId: string;
  coin: string;
  symbol: string;
  positionIdx: EPositionIdx;
  mode: EPositionMode;
  riskId: string;
  leverageE2: string;
  /**
   * false: 全仓
   */
  isIsolated: boolean;
  /**
   * false：不会自动追加
   */
  isAutoAddMargin: boolean;
  /**
   * 持仓状态
   */
  positionStatus: number;
  /**
   * 自动减仓排行
   */
  adlRankIndicator: number;
  /**
   * 持仓方向
   */
  side: EPositionSide;
  /**
   * 当前持仓size
   */
  sizeX: string;
  /**
   * 持仓价值
   */
  valueE8: string;
  /**
   * 持仓平均开仓价
   */
  entryPriceE8: string;
  /**
   * IM+折算平仓手续费
   */
  minPositionCostE8: string;
  markPriceE4: string;
  /**
   * 未结盈亏 (由 #1/#2/#3 汇总算出来)
   */
  unrealisedPnlE8: string;
  /**
   * 未结盈亏#1: 根据标记价格计算的浮动盈亏
   */
  unrealisedPnlByMpE8: string;
  /**
   * 未结盈亏#2: 根据市场价计算的浮动盈亏
   */
  unrealisedPnlByLpE8: string;
  /**
   * 未结盈亏#3: 根据最优手价计算出来的盈亏
   */
  UnrealisedPnlByBpE8: string;
  /**
   * 逐:初始锁定or额外追加 全:自动借调 用于cover持仓的真钱
   */
  extraAddedMarginE8: string;
  /**
   * 逐:初始锁定or额外追加 全:自动借调 用于cover持仓的真钱
   */
  positionBalanceE8: string;
  /**
   * 有效保证金, 极端情况下可能为负数 (可以折算出display leverage)
   */
  positionMarginE8: string;
  /**
   * 预占用平仓手续费
   */
  occClosingFeeE8: string;
  occFundingFeeE8: string;
  /**
   * 持仓强平价
   */
  liqPriceE4: string;
  /**
   * 持仓破产价
   */
  bustPriceE4: string;
  /**
   * Buy方向下单成本转化系数
   */
  bv2cE8: number;
  bv2c?: number;
  /**
   * Sell方向下单成本转化系数
   */
  sv2cE8: number;
  sv2c?: number;
  /**
   * 0: 无抵扣
   * +x: `Buy`方向最多可以有x手下单不会占成本, 实际开始占成本的是 $qty-x,
   * -y: 对应`Sell`方向
   */
  fqX: number;
  fq?: number;
  /**
   * 0: 无抵扣,
   * +j: `Buy`方向的free_qty抵扣完成后,算成本时固定减去j,
   * -k: 对应`Sell`方向
   */
  fcE8: number;
  /**
   * 用于cover订单成本的真钱
   */
  OrderBalanceE8: number;
  curTermRealisedPnlE8: number;
  /**
   * 当日已结盈亏, 每天UTC 00:00归档并重置到0重新统计
   */
  todayRealisedPnlE8: number;
  /**
   * 历史累计已结盈亏
   */
  cumRealisedPnlE8: number;
  tpTriggerBy: EOrderTriggerBy;
  slTriggerBy: EOrderTriggerBy;
  /**
   * 锚定仓位的止盈价
   */
  takeProfitE4: string;
  /**
   * 锚定仓位的止损价
   */
  stopLossE4: string;
  /**
   * 锚定仓位的追踪止损/追踪止盈点差
   */
  trailingStopE4: string;
  activationPriceE4: string;
  closingOrderId: string;
  closingPriceE4: string;
  closingQtyX: string;
  /**
   * 持仓更新时间
   */
  updatedAtE3: string;
  /**
   * 止盈止损模式
   */
  tpSlMode: ETpSlMode;
  /**
   * 止盈已设置数量（订单数量)
   */
  tpOrderNum: string;
  /**
   * 止损已设置数量（订单数量)
   */
  slOrderNum: string;
  /**
   * 止盈剩余可设置仓位大小
   */
  tpFreeSizeX: string;
  /**
   * 止损剩余可设置仓位大小
   */
  slFreeSizeX: string;
  markPrice: string;
  liqPrice: string;
  bustPrice: string;
  takeProfit: string;
  stopLoss: string;
  trailingStop: string;
  activationPrice: string;
  closingPrice: string;
}

export interface IClosedPndItem {
  userId: number;
  /**
   * 唯一订单号
   */
  orderId: string;
  /**
   * 合约名称
   */
  symbol: string;
  /**
   * 订单方向
   */
  side: EOrderSide;
  /**
   * 累计平仓数量
   */
  cumClosedSizeX: number;
  avgEntryPriceE8: number;
  /**
   * 被平掉部分的平均入场价
   */
  avgEntryPrice: string;
  avgExitPriceE8: number;
  /**
   * 被平掉部分的平均出场价
   */
  avgExitPrice: string;
  orderPriceE4: number;
  /**
   * 订单价格
   */
  orderPrice: string;
  /**
   * 成交类型
   */
  execType: string;
  /**
   * 创建时间 (当前是取订单创建时间,也可以考虑改成首笔成交时间)
   */
  createdAtE3: number;
  /**
   * 更新时间（最后一笔成交的时间）
   */
  updatedAtE3: number;
  /**
   *  成交时杠杆
   *
   */
  leverageE2: number;
  id: number;
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
  createdAtE3: number;
  updatedAtE3: number;
  transactTimeE3: number;
  status: string;
  reCalcEntryPrice: string | number;
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
  reCalcEntryPrice: string | number;
}

export interface IPositionItem extends IApiPositionItem, IWsPositionItem {}
