export * from 'common/packages-biz/global-settings';

export const MULTI_VIEW_SETTING_KEY = 'by_m_v_s_k_spot';

// 下单相关
export const ORDER_FORM_FIELDS_SPOT = {
  TYPE: 'type',
  SIDE: 'side',
  PRICE: 'price',
  TRIGGER_PRICE: 'triggerPrice', // 计划委托-触发价格
  QTY: 'quantity', // 以币种为单位的下单数量
  SYMBOL_ID: 'symbol_id',
  CLIENT_ORDER_ID: 'client_order_id',
};

export const ORDER_FORM_FIELDS_SPOT_INIT = {
  [ORDER_FORM_FIELDS_SPOT.TYPE]: 'limit',
  [ORDER_FORM_FIELDS_SPOT.SIDE]: 'BUY',
  [ORDER_FORM_FIELDS_SPOT.PRICE]: undefined,
  [ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE]: undefined,
  [ORDER_FORM_FIELDS_SPOT.QTY]: undefined,
  [ORDER_FORM_FIELDS_SPOT.SYMBOL_ID]: undefined,
  [ORDER_FORM_FIELDS_SPOT.CLIENT_ORDER_ID]: undefined,
};

export const ORDER_ACTION = {
  BUY: 'Buy',
  SELL: 'Sell',
};

export const SPOT_ORDER_COIN_TYPE = {
  COIN: 'coin', // 币种下单
  USDT: 'USDT', // u下单
  USD1: 'USD1',
  USDC: 'USDC',
  MARGIN: 'margin', // 保证金下单
};

export const ORDER_SIDES = {
  LONG: 'Buy',
  SHORT: 'Sell',
};

export const ORDER_TYPE = {
  LIMIT: 'Limit',
  MARKET: 'Market',
  CONDITION: 'Conditions',
};

export const TIME_IN_FORCE = {
  GOOD_TILL_CANCEL: 'GoodTillCancel',
  IMMEDIATE_OR_CANCEL: 'ImmediateOrCancel',
  FILL_OR_KILL: 'FillOrKill',
};

export const TRADE_STRATEGY = {
  POST_ONLY: 'PostOnly',
};

// ob相关

export const ORDER_BOOK_LEVEL = [20, 200];

export const FORWARD_TV_LOCAL_KEY = 'spot.tradingview.storeData';

export const MODE_TYPE = {
  MODE_SINGLE: 'MergedSingle',
  MODE_BOTH: 'BothSide',
};

// orderbook status
export const ORDER_BOOK_STATUS = {
  BUY: ORDER_ACTION.BUY,
  SELL: ORDER_ACTION.SELL,
  ALL: 'All',
  HOR: 'Horizontal',
};

export const ORDER_BOOK_TAB_MAP = [
  {
    type: ORDER_BOOK_STATUS.ALL,
    iconName: 'orderAll',
    gtmCategory: 'trade_orderbook',
    desc: 'ob-buysell',
  },
  {
    type: ORDER_BOOK_STATUS.BUY,
    iconName: 'orderBuy',
    gtmCategory: 'trade_orderbookbuy',
    desc: 'ob-buy',
  },
  {
    type: ORDER_BOOK_STATUS.SELL,
    iconName: 'orderSell',
    gtmCategory: 'trade_orderbooksell',
    desc: 'ob-sell',
  },
];

// 语言相关
export const FILTER_LANGUAGE_MAP = {
  en: 'en-US',
  'ko-KR': 'ko-KR',
  'de-DE': 'de-DE',
  'zh-TW': 'zh-TW',
  'ja-JP': 'ja-JP',
  'ru-RU': 'ru-RU',
};

// 新手引导
export const GUIDANCE_SEQUENCE = {
  preference: {
    id: 1,
    title: 'guidanceTradingPairTitle',
    content: 'guidanceTradingPairContent',
  },
  assets: {
    id: 2,
    title: 'guidanceAssetsTitle',
    content: 'guidanceAssetsContent',
  },
  order: {
    id: 3,
    title: 'guidanceOrderTitle',
    content: 'guidanceOrderContent',
  },
  markPrice: {
    id: 4,
    title: 'guidanceMarkPriceTitle',
    content: 'guidanceMarkPriceContent',
  },
  position: {
    id: 5,
    title: 'guidancePositionTitle',
    content: 'guidancePositionContent',
  },
};

export const GUIDANCE_SWITCH_STATUS_KEY = 'brand_g_s_s_k_spot';
export const GUIDANCE_CURRENT_STEP_KEY = 'brand_g_c_s_k_spot';

// ==================== 止盈止损（TP/SL）相关 ====================

// 价格类型常量：现货仅保留固定值，用于内部默认 triggerBy（不驱动任何 UI）
export const PRICE_TYPE = {
  MARKET: 'LastPrice', // 最新成交价（现货固定触发参照）
};

// 止盈止损方向枚举（恰好两个互不相同成员）
export const EOrderSLTP = {
  TP: 'TP',
  SL: 'SL',
};

// 止盈止损委托模式（PRD：限价委托 / 市价委托）
export const TP_SL_MODE = {
  LIMIT: 'LIMIT', // 限价委托：触发后按委托价挂限价单
  MARKET: 'MARKET', // 市价委托：触发后按 IOC 立即成交，未成交部分取消
};

// 委托价价格限制比例（PRD：买入 ≤ 触发价×1.05；卖出 ≥ 触发价×0.95）
export const TPSL_PRICE_LIMIT_PCT = 0.05;

// 止盈止损表单字段（PRD：触发价 + 委托价 + 委托模式，共六个 UI 字段）
// triggerBy 为固定默认值（LastPrice），不经 UI 选择，可保留为常量随单提交
export const TP_SL_FORM_FIELDS = {
  // 止盈
  TP_TRIGGER: 'tpTriggerPrice', // 止盈触发价
  TP_ORDER: 'tpOrderPrice', // 止盈委托价（限价模式）
  TP_MODE: 'tpMode', // 止盈委托模式 LIMIT/MARKET
  // 止损
  SL_TRIGGER: 'slTriggerPrice', // 止损触发价
  SL_ORDER: 'slOrderPrice', // 止损委托价（限价模式）
  SL_MODE: 'slMode', // 止损委托模式 LIMIT/MARKET
};

// 表单初始值：触发价/委托价为空，模式默认市价委托（高级限价委托能力已下线，
// 内联仅编辑触发价，触发后市价下单），触发价格类型固定为最新成交价（LastPrice，UI 不可改）
export const TP_SL_FORM_INIT = {
  [TP_SL_FORM_FIELDS.TP_TRIGGER]: undefined,
  [TP_SL_FORM_FIELDS.TP_ORDER]: undefined,
  [TP_SL_FORM_FIELDS.TP_MODE]: TP_SL_MODE.MARKET,
  [TP_SL_FORM_FIELDS.SL_TRIGGER]: undefined,
  [TP_SL_FORM_FIELDS.SL_ORDER]: undefined,
  [TP_SL_FORM_FIELDS.SL_MODE]: TP_SL_MODE.MARKET,
  // 固定触发参照（内部默认值，随单提交）
  tpTriggerBy: PRICE_TYPE.MARKET,
  slTriggerBy: PRICE_TYPE.MARKET,
};
