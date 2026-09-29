import { LANGUAGES as LANS } from '@region-lib/language';

// WARING 本文件已经被webworker 引用, 无法使用 window 对象，
// domain 相关的配置已经放到 domain.js 中
/*
 * ***************************************************
 * some localStorage keys
 */
/**
 * localStorage i18n key for every web sites
 */
export const LANGUAGES = LANS;

/**
 * postOnly
 */
export const POST_ONLY_KEY = 'by_post_only';

export const POST_ONLY_TYPES = {
  USDT_SINGLE: 'usdtSingle',
  USDT_BUY: 'usdtBuy',
  USDT_SELL: 'usdtSell',
  USDT_REDUCE_ONLY: 'usdtReduceOnly',
  INVERSE_SINGLE: 'inverseSingle',
  INVERSE_BUY: 'inverseBuy',
  INVERSE_SELL: 'inverseSell',
  INVERSE_REDUCE_ONLY: 'inverseReduceOnly',
};

/**
 * a sequence of feat tip
 */
export const FEAT_TIP_STEP_KEY = 'by_f_t_s_k';

/**
 * ONKEYDOWN
 */
export const ONKEYDOWN_TYPES = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
};

/**
 * Right-Slider-Bar Setting
 */

/**
 * Trade-Type
 */
export const TRADE_TYPE = {
  INVERSE: 'InversePerpetual',
  LINEAR: 'LinearPerpetual',
  FUTURE: 'InverseFutures',
  UNKNOWN: 'Unknown',
};
/**
 * Trade-Type header symbol-list 对应字段
 */
export const TRADE_HEADER_TYPE = {
  INVERSE: 'inverse',
  LINEAR: 'linear',
  FUTURE: 'inverseFuture',
  UNKNOWN: 'Unknown',
};

/**
 * 页面刷新状态
 */
export const APP_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
};
/**
 * positionIdx
 */
export const POSITION_IDX = {
  SINGLE: '0',
  LONG: '1',
  SHORT: '2',
};

/**
 * 全仓切换逐仓默认杠杆
 */
export const DEFAULT_LEVERAGE = 10;

/**
 * 杠杆step
 */
export const LEVERAGE_STEP = 10;

/**
 * 全逐仓仓位模式切换
 */
export const POSITION_MODE = {
  CROSS: 'Cross',
  ISOLATE: 'Isolate',
};

/**
 * 交易模式切换（个人交易/带单交易）
 */
export const TRADE_MODE = {
  PERSONAL_TRADE: 'personalTrading',
  TRADE_WITH_ORDER: 'tradingWithOrders',
};
/**
 * 全仓切换杠杆灰度切量 暂时写死在前端
 */
export const ABTestResult = {
  crossLvg: {
    BTC: ['all'],
    ETH: ['all'],
    EOS: ['all'],
    XRP: ['all'],
    USDT: ['all'],
  },
};

const PRICE_INPUT_LABELS_LEVEL = [10, 50, 200]; // tickSize 的 10倍、50倍、200倍

/**
 * @param {string} ratios 倍数列表
 * @param {number} ticksize 基础值
 * @param {number} priceScale Id 放大倍数
 */
const getDepthsByTick = ({ ratios = '1,2,4,10', tickSize, priceScale = 4 }) => {
  if (!Number(tickSize) || !ratios || !ratios.split) return [];
  return ratios.split(',').map((ratio) => {
    const value = Number(tickSize) * ratio;
    let meta = { priceScale };
    if (ratio === 1) meta = { ...meta, isDefault: true };
    return { label: value, ratio, value, meta };
  });
};

const getPriceInputLabelsByTick = (ticksize) => {
  let labels = [];
  if (!Number(ticksize)) return labels;
  PRICE_INPUT_LABELS_LEVEL.forEach((ratio) => {
    const value = Number(ticksize) * ratio;
    labels = [
      ...labels,
      {
        label: `+${value}`,
        value,
      },
      {
        label: `-${value}`,
        value: -value,
      },
    ];
  });
  return labels;
};

export const COINS = {
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT',
};

export const FUTURE_ROUTE = {
  CurQ: 'Q',
  NextQ: 'BIQ',
  NNextQ: 'NBIQ',
};

export const SYMBOLS = {
  BTCUSDT: {
    symbol: 'BTCUSDT',
    symbolName: 'BTCUSDT',
    coin: 'BTC',
    baseCoin: 'USDT',
    contractStatus: 'Trading', // Trading Closed
    contractType: 'LinearPerpetual', // InversePerpetual, LinearPerpetual, InverseFutures
    maxPrice: 999999, // 最大下单价格
    minPrice: 0.5, // 最小下单价格
    maxQty: 100, // 最大订单数量
    minQty: 0.001, // 最小订单数量
    balanceFraction: 4, // 资产精度
    upnlFraction: 4,
    priceScale: 4, // 价格放大倍数
    tickSize: 0.5, // 价格tick
    tickSizeFraction: 1, // 输入价格精度
    priceStep: 5, // 价格 tick
    priceFraction: 2, // 显示价格精度
    lotStep: 1,
    lotSize: 0.001, // 数量 tick
    lotFraction: 3, // 输入数量精度
    obDepthMergeTimes: '1,2,4,10', // ob 深度档位 倍数
    indexSort: 5, // 排序
    initMargin: 1, // 起始保证金率
    maintainMargin: 0.5, // 维持保证金率
    imIncrements: 0.5, // 起始保证金递增
    mmIncrements: 0.5, // 起始保证金递增
    rLBases: 1_000_000, // 阶梯保证金率
    rLIncrements: 1_000_000, // 阶梯保证金率
    section: ['1', '2', '3', '5', '10', '25', '50', '100'], // 默认杠杆
    symbolDepths: getDepthsByTick({ tickSize: 0.5 }), // []
    priceInputLabels: getPriceInputLabelsByTick(0.5), // []
    quarter: 'UnKnown',
    symbolTags: '',
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    symbolName: 'ETHUSDT',
    coin: 'ETH',
    baseCoin: 'USDT',
    contractStatus: 'Trading', // Trading Closed
    contractType: 'LinearPerpetual', // InversePerpetual, LinearPerpetual, InverseFutures
    maxPrice: 99999, // 最大下单价格
    minPrice: 0.05, // 最小下单价格
    maxQty: 1000, // 最大订单数量
    minQty: 0.01, // 最小订单数量
    balanceFraction: 4, // 资产精度
    upnlFraction: 4,
    priceScale: 4, // 价格放大倍数
    tickSize: 0.05, // 价格tick
    tickSizeFraction: 2, // 输入价格精度
    priceStep: 5, // 价格 tick
    priceFraction: 2, // 显示价格精度
    lotStep: 1,
    lotSize: 0.01, // 数量 tick
    lotFraction: 2, // 输入数量精度
    obDepthMergeTimes: '1,2,4,10', // ob 深度档位 倍数
    indexSort: 6, // 排序
    initMargin: 2, // 起始保证金率
    maintainMargin: 1, // 维持保证金率
    imIncrements: 1, // 起始保证金递增
    mmIncrements: 0.5, // 起始保证金递增
    rLBases: 800_000, // 阶梯保证金率
    rLIncrements: 800_000, // 阶梯保证金率
    section: ['1', '2', '3', '5', '10', '15', '30', '50'], // 默认杠杆
    symbolDepths: getDepthsByTick({ tickSize: 0.05 }), // []
    priceInputLabels: getPriceInputLabelsByTick(0.05), // []
    quarter: 'UnKnown',
    symbolTags: '',
  },
};

// 请求symbol-list 接口的状态
export const SYMBOL_STATUS_TYPES = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const POZ_DIRECTION = {
  LONG: 'DIRECTION_LONG',
  SHORT: 'DIRECTION_SHORT',
};

// /user/private/v3/profile接口返回的
export const USER_SETTINGS = {
  ORDER_CONFIRM: 'confirmOrder',
  CANCEL_ALL_CONFIRM: 'confirmCancelAll',
  OB_ANIMATION: 'orderAnimation',
  POSITION_CONFIRM: 'confirmPosition',
  hideAggregationPositions: 'hideAggregationPositions',
  SUCCESS_AUDIO: 'successAudio',
};

export const TICK_DIRECTION = {
  PLUS: 'PlusTick',
  MINUS: 'MinusTick',
  ZERO_PLUS: 'ZeroPlusTick',
  ZERO_MINUS: 'ZeroMinusTick',
};

export const LVG_HIGH_TIP_LEVEL = 20;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// 缓存当前从symbolList哪个tab跳转
export const CLICK_FROM_TRADE_TAB_TYPE = 'trade_c_f_t_t_t';

// 缓存symbolList 排序 key
export const TRADE_SYMBOL_LIST_SORT_KEY = 'trade_symbol_list_sort';

// 正向layout storageKey
export const LAYOUT_STORAGE_KEY_LINEAR = 'region-layout_linear';

export const execTypeKeyMap = {
  Trade: 'Trade',
  BustTrade: 'BustTrade',
};
