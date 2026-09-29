export * from './index';

export const LEVERAGE = {
  MIN: 1,
  MAX: 100
};

export const PRICE_TYPE = {
  MARKET: 'LastPrice',
  INDEX: 'IndexPrice',
  MARK: 'MarkPrice'
};

export const TICK_DIRECTION = {
  PLUS: 'PlusTick',
  MINUS: 'MinusTick',
  ZERO_PLUS: 'ZeroPlusTick',
  ZERO_MINUS: 'ZeroMinusTick'
};

export const TICK_DIRECTION_MAP = {
  [TICK_DIRECTION.PLUS]: {
    icon: 'icon-arrow-up',
    color: 'long'
  },
  [TICK_DIRECTION.ZERO_PLUS]: {
    icon: 'icon-arrow-up',
    color: 'long'
  },
  [TICK_DIRECTION.MINUS]: {
    icon: 'icon-arrow',
    color: 'short'
  },
  [TICK_DIRECTION.ZERO_MINUS]: {
    icon: 'icon-arrow',
    color: 'short'
  }
};

/**
 * Related to ReduceOnly
 */
export const ORDER_ACTION = {
  BUY: 'Buy',
  SELL: 'Sell'
};

/**
 * Related to side
 */
export const ORDER_SIDES = {
  LONG: 'Buy',
  SHORT: 'Sell'
};

export const ORDER_TYPE = {
  LIMIT: 'Limit',
  MARKET: 'Market',
  CONDITION: 'Conditions'
};

export const TIME_IN_FORCE = {
  GOOD_TILL_CANCEL: 'GoodTillCancel',
  IMMEDIATE_OR_CANCEL: 'ImmediateOrCancel',
  FILL_OR_KILL: 'FillOrKill'
};
export const TRADE_STRATEGY = {
  POST_ONLY: 'PostOnly'
};

export const ORDER_BOOK_LEVEL = [20, 200];

export const TP_SL_MODE = {
  FULL: 'Full',
  PARTIAL: 'Partial',
  UNKNOWN: 'UNKNOWN'
};

export const TP_SL = {
  TAKEPROFIT: 'TakeProfit',
  STOPLOSS: 'StopLoss',
  PARTIAL_TAKEPROFIT: 'PartialTakeProfit',
  PARTIAL_STOPLOSS: 'PartialStopLoss'
};

export const FORWARD_TV_LOCAL_KEY = 'forward.tradingview.storeData';

export const MODE_TYPE = {
  MODE_SINGLE: 'MergedSingle',
  MODE_BOTH: 'BothSide'
};

export const GUIDANCE_SWITCH_STATUS_KEY = 'by_g_s_s_k';

export const GUIDANCE_CURRENT_STEP_KEY = 'by_g_c_s_k';

/**
 * a sequence of feat tip
 */
export const FEAT_TIP_STEP_KEY = 'by_f_t_s_k';
// orderbook status
export const ORDER_BOOK_STATUS = {
  BUY: ORDER_ACTION.BUY,
  SELL: ORDER_ACTION.SELL,
  ALL: 'All',
  HOR: 'Horizontal'
};

export const MULTI_VIEW_SETTING_KEY = 'by_m_v_s_k';
// 新手引导的顺序
export const GUIDANCE_SEQUENCE = {
  preference: {
    id: 1,
    title: 'guidanceTradingPairTitle',
    content: 'guidanceTradingPairContent'
  },
  assets: {
    id: 2,
    title: 'guidanceAssetsTitle',
    content: 'guidanceAssetsContent'
  },
  order: {
    id: 3,
    title: 'guidanceOrderTitle',
    content: 'guidanceOrderContent'
  },
  markPrice: {
    id: 4,
    title: 'guidanceMarkPriceTitle',
    content: 'guidanceMarkPriceContent'
  },
  position: {
    id: 5,
    title: 'guidancePositionTitle',
    content: 'guidancePositionContent'
  }
};

// 行情推送的里的obLevel
export const OB_LEVEL_MAP = {
  MAX: 200,
  EIGHTY: 200, // 公有行情更新后，移除80ms的档位
  DEFAULT: 20
};

export const FILTER_LANGUAGE_MAP = {
  en: 'en-US',
  'ko-KR': 'ko-KR',
  'de-DE': 'de-DE',
  'zh-TW': 'zh-TW',
  'zh-CN': 'zh-CN'
};
