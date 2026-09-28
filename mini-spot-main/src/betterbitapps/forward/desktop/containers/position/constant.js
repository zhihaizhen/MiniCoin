export const orderTypeKeyMap = {
  Limit: 'limitOrder',
  Market: 'marketOrder',
};

export const TAB_KEY = {
  LIMIT: 'limit',
  TRIGGER: 'trigger',
  TPSL: 'tpsl',
  MOVINGTPSL: 'movingTpSl',
};

// plan_order 的 plan_type：
// - 列表查询可不传（返回 NORMAL + PROFIT_OR_STOP 合集，前端按项分流）
// - 创建计划委托 / 批量撤单仍传：NORMAL=普通计划委托，PROFIT_OR_STOP=止盈/止损
export const PLAN_TYPE = {
  NORMAL: 'NORMAL',
  PROFIT_OR_STOP: 'PROFIT_OR_STOP',
};

export const POSITION_TAB_LIST = [
  { name: 'entrust', title: 'currentEntrust' },
  { name: 'history', title: 'historyEntrust' },
  { name: 'deal', title: 'dealRecord' },
];

// 持仓区子 tab：限价｜市价 / 止盈止损 / 计划委托（顺序与设计图一致）
export const filterTabList = [
  {
    label: 'limitOrMarketEntrust', // 限价｜市价
    key: TAB_KEY.LIMIT,
  },
  {
    label: 'tpslEntrust', // 止盈/止损
    key: TAB_KEY.TPSL,
  },
  {
    label: 'triggerEntrust', // 计划委托
    key: TAB_KEY.TRIGGER,
  },
];

// 订单状态文案映射（止盈止损 / 计划委托 子 tab 的「订单状态」列）
// 当前委托恒为待触发（status 固定为 WAITING）；历史委托按后端 status 映射为已触发 / 已撤销 / 已过期 / 已失败
export const PLAN_ORDER_STATUS_TEXT = {
  // 当前委托（待触发）
  WAITING: 'pendingTrigger',
  // 历史委托
  TRIGGERED: 'orderTriggered', // 已触发
  CANCELED: 'orderCanceledStatus', // 已撤销
  CANCELLED: 'orderCanceledStatus',
  EXPIRED: 'orderExpiredStatus', // 已过期
  FAILED: 'orderFailedStatus', // 已失败
};

/**
 * 计划委托状态文案取值（含未知值容错回退）
 * - 已知状态返回对应 i18n key
 * - 未知/空状态返回空字符串，不抛异常、不中断列表渲染
 * @param {string} status 后端返回的计划委托状态值
 * @returns {string} 用于 i18n 翻译的文案 key，未知状态为空字符串
 */
export const getPlanOrderStatusText = (status) =>
  (status && PLAN_ORDER_STATUS_TEXT[status]) || '';

// 后端接口 stopOrderType字段
export const tpslKeyMap = {
  UNKNOWN: '', // 普通订单，非条件单，非止盈止损
  Stop: 'marketTrigger', // 市价计划委托
  TakeProfit: 'market-full-tp', // 市价全部止盈
  StopLoss: 'market-full-sl', // 市价全部止损
  MovingTpSl: 'movingTpsl',
  TrailingStop: 'Trailing-Stop-Loss', // 追踪出场
  TrailingProfit: '', // 没有使用
  PartialTakeProfit: 'market-partial-tp', //   市价部分止盈
  PartialStopLoss: 'market-partial-sl', //   市价部分止损
};

export const transactionTypeList = [
  {
    value: 'all',
    label: 'allTransactionType',
  },
  {
    value: 'Trade',
    label: 'Trade',
  },
  {
    value: 'BustTrade',
    label: 'BustTrade',
  },
];
