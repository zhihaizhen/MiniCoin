import { toNumber } from '@unified/helpers';
import { COINS, THEMES } from '../common/packages-biz/by-global-settings';
import { FEAT_TIP_STEP_KEY } from '../common/packages-biz/by-global-settings/usdt-settings';
import { Env } from '@region-lib/env';
import { setEasyRouter } from '../utils/easy-router';

const { THEME_KEY } = Env;

const ns = 'global';

const initStates = {
  nickName: '',
  symbolName: '', // 当前页面币对的 symbolAlias (dynamic-symbol接口)
  symbol: '', // 当前页面币对的 symbolName (dynamic-symbol接口)
  similarSymbol: '', // 同 symbol (dynamic-symbol接口)
  coin: '', // 当前页面币对的 baseCurrency (dynamic-symbol接口)
  baseCoin: COINS.USDT, // 当前页面币对的 quoteCurrency (dynamic-symbol接口)
  obLevel: 20, // 订单深度
  offline: false, // 是否断线
  netShift: false, // 是否断线且状态码 > 400
  quickPrice: 0, // 点击订单表对应的价格
  visibility: true, // 当前页面是否可见，通过 visibilitychange 事件控制
  isFutures: false, // 是否交割，已屏蔽交割
  currentFeatTipStep: process.browser
    ? Number(localStorage.getItem(FEAT_TIP_STEP_KEY)) || 1
    : 1, // 多视图设置，现在已屏蔽
  hideSetting: process.browser
    ? localStorage.getItem('MULTI_VIEW_SETTING_STATUS') === 'hide'
    : true, // 多视图设置状态，已屏蔽
  currentTheme: process.browser
    ? localStorage.getItem(THEME_KEY) || THEMES.DARK
    : THEMES.DARK // 当前主题
};

const types = {
  SET_SYMBOL_AND_COIN: 'setSymbolAndCoin',
  SET_ORDER_BOOK_LEVEL: 'SET_ORDER_BOOK_LEVEL',
  NETWORK_CHANGE: 'NETWORK_CHANGE', // ws 断连 提示
  NETWORK_SHIFT: 'NETWORK_SHIFT', // 线路切换 提示
  SET_QUICK_PRICE: 'SET_QUICK_PRICE',
  VISIBILITY_CHANGE: 'VISIBILITY_CHANGE',
  SET_CURRENT_THEME: 'SET_CURRENT_THEME',
  SET_HIDE_MULTI_VIEW_SETTING: 'SET_HIDE_MULTI_VIEW_SETTING',
  CLEAR_SYMBOL_FETCH_NOW: 'CLEAR_SYMBOL_FETCH_NOW'
};

const actions = {
  /**
   * Set global symbol
   *
   * @param {object} state The Draft state
   * @param {object} action The operation action with data
   */
  [types.SET_SYMBOL_AND_COIN](state, { symbolConfig = {} }) {
    const { symbol, coin, baseCoin, symbolName } = symbolConfig;
    if (state.symbol === symbol) return;
    [
      'activityList',
      'conditionsList',
      'historyList',
      'dealList',
      'profitList'
    ].forEach((key) => {
      state.position[key].loaded = false;
      state.position[key].list = [];
      state.position[key].symbol = symbol;
    });
    state.quickPrice = 0;
    state.symbol = symbol;
    state.symbolName = symbolName;
    state.coin = coin;
    state.baseCoin = baseCoin;
    state.similarSymbol = symbol;
    state.isFutures = false;
    // setEasyRouter(symbolConfig);
  },
  /**
   * Set order book level
   *
   * @param {object} state The Draft state
   * @param {object} action The operation action with data
   */
  [types.SET_ORDER_BOOK_LEVEL](state, action) {
    state.obLevel = action.level;
  },

  [types.NETWORK_CHANGE](state, payload) {
    state.offline = payload.show;
  },

  [types.NETWORK_SHIFT](state, payload) {
    if (!payload.show) {
      state.netShift = false;
    } else if (!state.offline) {
      if (
        payload?.e &&
        (payload.e?.status > 400 || payload.e instanceof TypeError)
      ) {
        state.netShift = true;
      }
      // console.log(payload.e, 'e');
      // 200 + 200 nobody config data url
      // 204: SyntaxError
      // 305 + 304 code: Symbol(900300200)
      // 404 status: 404
      // 500 status: 500
      // cors error TypeError
    }
  },

  [types.SET_QUICK_PRICE](state, { price }) {
    state.quickPrice = toNumber(price);
  },

  [types.VISIBILITY_CHANGE](state, { visibility }) {
    state.visibility = visibility;
  },

  [types.UPDATE_FEAT_TIP_STEP](state, { step }) {
    state.currentFeatTipStep = step;
  },

  [types.SET_HIDE_MULTI_VIEW_SETTING](state, { status }) {
    state.hideSetting = status;
  },

  [types.SET_CURRENT_THEME](state, { targetThemeName }) {
    state.currentTheme = targetThemeName;
  },
  [types.CLEAR_SYMBOL_FETCH_NOW](state) {
    state.fetchSymbolStart = 0;
  }
};

export default {
  ns,
  initStates,
  types,
  actions
};
