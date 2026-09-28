/* eslint-disable no-useless-escape */
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
export const POST_ONLY_KEY = 'post_only';

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
 * ONKEYDOWN
 */
export const ONKEYDOWN_TYPES = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  DEL: 8,
  ENTER: 13,
  DECIMAL: 190,
};

export const TAB_LIST = [
  {
    type: 'book',
    translationTxt: 'bookSymbolTab', // 自选
  },
  {
    type: 'all',
    translationTxt: 'all', // 全部
  },
];

/**
 * 页面刷新状态
 */
export const APP_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
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
 * 合仓和分仓模式切换
 */
export const POSITION_ORDER_MODE = {
  MERGE: 'Merge',
  SPLIT: 'Split',
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

// 避免展示科学计数
const toNumberStr = (num, digits = 20) => {
  // 正则匹配小数科学记数法
  if (/^(\d+(?:\.\d+)?)(e)([\-]?\d+)$/.test(num)) {
    // 正则匹配小数点最末尾的0
    const temp = /^(\d{1,}(?:,\d{3})*\.(?:0*[1-9]+)?)(0*)?$/.exec(
      num.toFixed(digits),
    );
    if (temp) {
      return temp[1];
    }
    return num.toFixed(digits);
  }
  return `${num}`;
};

export const COINS = {
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT',
};

export const SYMBOLS = {
  BTC: {
    symbol: 'BTC',
    symbolAlias: 'BTC',
    symbolFullName: 'BTC/USDT',
    spotCoin: 'BTC',
    walletCoin: 'USDT',
    coin: 'BTC',
    maxPrice: 999999, // 最大下单价格
    minPrice: 0.5, // 最小下单价格
    maxQty: 100, // 最大订单数量
    minQty: 0.001, // 最小订单数量
    balanceFraction: 4, // 资产精度
    upnlFraction: 4,
    riskTags: [],

    tickSize: 0.5, // 价格tick
    tickSizeFraction: 1, // 输入价格精度
    priceStep: 5, // 价格 tick
    priceFraction: 2, // 显示价格精度
    lotStep: 1,
    lotSize: 0.001, // 数量 tick
    lotFraction: 3, // 输入数量精度

    indexSort: 5, // 排序
    section: ['1', '2', '3', '5', '10', '25', '50', '100'], // 默认杠杆
    // dumpScale为ws 参数：0.01=>2, 0.1=>1, 1=>-1, 10=>-2, 100=>-3
    // id为ws 参数：0.01=>2, 0.1=>1, 1=>0, 10=>-1, 100=>-2
    symbolDepths: [
      {
        label: '0.01',
        value: '0.01',
        meta: { id: 2, dumpScale: 2, value: 0.1, isDefault: true },
      },
      {
        label: '0.1',
        value: '0.1',
        meta: { id: 1, dumpScale: 1, value: 0.1, isDefault: false },
      },
      {
        label: '1',
        value: '1',
        meta: { id: 0, dumpScale: -1, value: 0.1, isDefault: false },
      },
      {
        label: '10',
        value: '10',
        meta: { id: -1, dumpScale: -2, value: 0.1, isDefault: false },
      },
    ], // []
    symbolTags: '',
  },
  ETH: {
    symbol: 'ETH',
    symbolAlias: 'ETH',
    symbolFullName: 'ETH/USDT',
    spotCoin: 'ETH',
    walletCoin: 'USDT',
    coin: 'ETH',
    maxPrice: 999999, // 最大下单价格
    minPrice: 0.5, // 最小下单价格
    maxQty: 100, // 最大订单数量
    minQty: 0.001, // 最小订单数量
    balanceFraction: 4, // 资产精度
    upnlFraction: 4,
    riskTags: [],

    tickSize: 0.5, // 价格tick
    tickSizeFraction: 1, // 输入价格精度
    priceStep: 5, // 价格 tick
    priceFraction: 2, // 显示价格精度
    lotStep: 1,
    lotSize: 0.001, // 数量 tick
    lotFraction: 3, // 输入数量精度

    indexSort: 5, // 排序
    section: ['1', '2', '3', '5', '10', '25', '50', '100'], // 默认杠杆
    symbolDepths: [
      {
        label: '0.01',
        value: '0.01',
        meta: { id: 2, dumpScale: 2, value: 0.1, isDefault: true },
      },
      {
        label: '0.1',
        value: '0.1',
        meta: { id: 1, dumpScale: 1, value: 0.1, isDefault: false },
      },
      {
        label: '1',
        value: '1',
        meta: { id: 0, dumpScale: -1, value: 0.1, isDefault: false },
      },
      {
        label: '10',
        value: '10',
        meta: { id: -1, dumpScale: -2, value: 0.1, isDefault: false },
      },
    ], // []
    symbolTags: '',
  },
};

// 请求symbol-list 接口的状态
export const SYMBOL_STATUS_TYPES = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

// /user/private/v3/profile接口返回的
export const USER_SETTINGS = {
  ORDER_CONFIRM: 'spot.confirmOrder',
  CANCEL_ALL_CONFIRM: 'spot.confirmCancelAll',
  OB_ANIMATION: 'orderAnimation', // 订单表执行提示
  POSITION_CONFIRM: 'confirmPosition',
  hideAggregationPositions: 'hideAggregationPositions', // 仓位展示所有仓位
  SUCCESS_AUDIO: 'playSuccessAudio', // 开启声音
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

// 从symbolList哪个tab跳转
export const SPOT_SYMBOLS_TAB = 'spot_symbols_tab';

// 缓存symbolList 排序 key
export const SPOT_SYMBOLS_TABLE_SORT = 'spot_symbols_table_sort';

// 现货二级板块分类缓存 key
export const SPOT_SECTION_CATEGORY_TYPE = 'spot_section_category';

// layout storageKey
export const LAYOUT_STORAGE_KEY_SPOT = 'region_layout_spot';

export const execTypeKeyMap = {
  Trade: 'Trade',
  BustTrade: 'BustTrade',
};


export const TRADE_THEME_KEY = 'TRADE_THEME';

export const TRADE_THEMES = {
  DARK: 'theme-dark',
  LIGHT: 'theme-light',
};

export function getTradeTheme() {
  return localStorage.getItem(TRADE_THEME_KEY) || TRADE_THEMES.DARK;
}

export function setTradeTheme(theme) {
  localStorage.setItem(TRADE_THEME_KEY, theme);
}

export function getTradeViewThemeName() {
  return getTradeTheme() === TRADE_THEMES.LIGHT ? 'light' : 'dark';
}
