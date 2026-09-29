import { toNumber } from '@unified/helpers';
import { COINS, SYMBOLS, getTradeTheme } from 'common/packages-biz/global-settings';
import { setEasyRouter } from '@/utils/easy-router';

const ns = 'global';

const initStates = {
  symbol: '', // 当前页面币对如BTC
  symbolAlias: '', // 当前页面币对的别名 如BTCUSDT
  symbolFullName: '', // 路由币对名称，如BTC/USDT
  coin: '', // 当前页面币对
  walletCoin: '', // 现货结算的币种，如USDT
  spotCoin: '', // 现货下单的币种，如BTC
  balanceFraction: 4, // 资产精度
  lotFraction: 3, // 数量精度
  obDepthInfo: {
    id: 0,
    dumpScale: 0,
    value: 0.01,
    isDefault: true,
  }, // orderbook 的ws的topic用的
  kineDepthVisible: false, // orderbook 深度图是否显示
  offline: false, // 是否断线
  netShift: false, // 是否断线且状态码 > 400
  quickPrice: 0, // 点击订单表对应的价格
  visibility: true, // 当前页面是否可见，通过 visibilitychange 事件控制
  currentTheme: getTradeTheme(), // 当前主题
  allSpotTokenConfig: {
    USDT: {
      BTC: [SYMBOLS.BTC],
      ETH: [SYMBOLS.ETH],
    },
    USDC: {
      BTC: [SYMBOLS.BTC],
      ETH: [SYMBOLS.ETH],
    },
  },

  allSpotTokenList: {
    USDT: [SYMBOLS.BTC, SYMBOLS.ETH],
    USDC: [SYMBOLS.BTC, SYMBOLS.ETH],
  },

  currentStartAt: 0, // 当前k线的时间
  currentBuySellItem: null, // 当前买卖标记
  currentResolution: localStorage.getItem('resolution') || '15', // 当前k线的时间
  currentChartType: 1, // 当前k线的类型 Candle
  curShapes: {}, // 当前k线的形状id
  assetOptionList: [], // 资产区支持的币种
  chartType: 'k', // k表示kline, d表示深度图
  sectionCategory: [], // 板块分类
};

// const drawMarks = debounce((params) => {
//   addBuySellMark(params);
// }, 100);

const types = {
  SET_ASSET_OPTION_LIST: 'SET_ASSET_OPTION_LIST',
  SET_CUR_SHAPE: 'SET_CUR_SHAPE',
  CLEAR_CUR_SHAPE: 'CLEAR_CUR_SHAPE',
  SET_Current_StartAt: 'setCurrentStartAt',
  SET_Current_Resolution: 'setCurrentResolution',
  SET_Current_ChartType: 'setCurrentChartType',
  SET_SYMBOL_AND_COIN: 'setSymbolAndCoin',
  SET_ORDER_BOOK_LEVEL: 'SET_ORDER_BOOK_LEVEL',
  NETWORK_CHANGE: 'NETWORK_CHANGE', // ws 断连 提示
  NETWORK_SHIFT: 'NETWORK_SHIFT', // 线路切换 提示
  SET_QUICK_PRICE: 'SET_QUICK_PRICE',
  VISIBILITY_CHANGE: 'VISIBILITY_CHANGE',
  SET_CURRENT_THEME: 'SET_CURRENT_THEME',

  SET_ALL_SPOT_SYMBOL_LIST: 'SET_ALL_SPOT_SYMBOL_LIST',
  SET_CHART_TYPE: 'SET_CHART_TYPE',
  SET_DEPTH_KLINE_VISIBLE: 'SET_DEPTH_KLINE_VISIBLE',
  SET_SPOT_SECTION_CATEGORY: 'SET_SPOT_SECTION_CATEGORY',
};

const actions = {
  [types.SET_ASSET_OPTION_LIST](state, payload) {
    state.assetOptionList = payload.data;
  },
  [types.SET_CUR_SHAPE](state, payload) {
    const curDrawingItm = window?.curShape;
    if (curDrawingItm) {
      const isBuy =
        payload?.data?.side === 'Buy' ||
        window.curShape[state.currentStartAt]?.buy;
      const isSell =
        payload?.data?.side === 'Sell' ||
        window.curShape[state.currentStartAt]?.sell;
      window.curShape[state.currentStartAt] = {
        startAt: state.currentStartAt,
        ...window.curShape[state.currentStartAt],
        ...payload.data,
        sell: isSell,
        buy: isBuy,
      };
    }
    // console.log(payload, 'payload3333');
    // state.curShapes = { ...state.curShapes, ...payload.data };
  },
  [types.SET_CHART_TYPE](state, payload) {
    state.chartType = payload.data;
  },
  [types.CLEAR_CUR_SHAPE](state, payload) {
    state.curShapes = {};
  },
  [types.SET_Current_ChartType](state, payload) {
    state.currentChartType = payload.data;
  },
  [types.SET_Current_Resolution](state, payload) {
    state.currentResolution = payload.data;
  },
  [types.SET_Current_StartAt](state, payload) {
    state.currentStartAt = payload.data;
  },

  /**
   * Set global symbol
   *
   * @param {object} state The Draft state
   * @param {object} action The operation action with data
   */

  // 点击切换币种，step1 重置基本信息 step2 更改路由
  [types.SET_SYMBOL_AND_COIN](state, { symbolConfig = {} }) {
    const {
      symbol,
      symbolAlias,
      symbolFullName,
      coin,
      walletCoin,
      spotCoin,
      symbolDepths,
      lotFraction,
      walletCoinOrderFraction,
      lotSize,
    } = symbolConfig;
    if (state.symbolFullName === symbolFullName) return;
    state.quickPrice = 0;
    state.symbol = symbol;
    state.symbolAlias = symbolAlias;
    state.symbolFullName = symbolFullName;
    state.coin = coin;
    state.spotCoin = spotCoin;
    state.walletCoin = walletCoin;
    state.lotFraction = lotFraction;
    state.lotSize = lotSize;
    state.walletCoinOrderFraction = walletCoinOrderFraction;
    state.obDepthInfo = symbolDepths?.[0]?.meta;

    setEasyRouter(symbolConfig);
  },

  // 初始化的时候就应该set
  [types.SET_ORDER_BOOK_LEVEL](state, action) {
    // console.log('step3,修改states数据', action);
    state.obDepthInfo = action.depthInfo; // 用于ws
  },

  [types.SET_DEPTH_KLINE_VISIBLE](state, { visible }) {
    state.kineDepthVisible = visible;
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

  [types.SET_CURRENT_THEME](state, { targetThemeName }) {
    state.currentTheme = targetThemeName;
  },

  [types.SET_ALL_SPOT_SYMBOL_LIST](state, { data, list }) {
    // console.log('SET_ALL_SPOT_SYMBOL_LIST data', data);
    state.allSpotTokenConfig = data;
    state.allSpotTokenList = list;
  },

  [types.SET_SPOT_SECTION_CATEGORY](state, payload) {
    state.sectionCategory = payload.data;
  },

};

export default {
  ns,
  initStates,
  types,
  actions,
};
