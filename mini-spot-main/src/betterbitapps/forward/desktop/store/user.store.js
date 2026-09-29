import { getLang, setLang } from 'common/utils/storageData';
import { initWalletState } from 'common/model/private/wallet';

const ns = 'user';

const initWallet = (coin) => ({
  tokenName: coin,
  tokenId: coin,
  ...initWalletState,
});

const initStates = {
  // 用户信息
  userInfo: window.sessionStorage.userInfo
    ? JSON.parse(window.sessionStorage.userInfo)
    : {
        defaultAccountId: '',
        userId: '',
      },
  info: {
    id: 0,
    profileApiLoaded: false,
  },
  token: '',
  language: getLang(),

  wallet: {
    USDT: initWallet('USDT'),
    BTC: initWallet('BTC'),
    ETH: initWallet('ETH'),
  },
  invitesInfo: null,
  kline: {
    closePositionTipStatus: 'show', // 二次弹窗设置--快捷平仓，k线使用
    cancelOrderTipStatus: 'show', // 二次弹窗设置--快捷取消，k线使用，设置是否需要快捷取消弹窗确认
  },
  exchangeRate: {
    currencyCode: 'USD',
    fiatList: [],
    rate: 1,
  }, // 汇率和法币单位
  bookSymbolSetStatus: 'bookSymbolChangeRateSet', // 设置交易对收藏栏展示风格，根据涨跌幅或者最新市价展示
  // orderBook设置
  orderBookSetting: {
    quickOperate: 'hide',
  }, // 默认关闭
  abTestResult: {},
  orderType: localStorage.getItem('orderType') || 'Market', // 下单类型，优先从浏览器偏好获取，如果没有则选择市价单
  orderCoinType: {}, // 下单的币种类型，优先从浏览器偏好获取，默认数量
  rateInfo: {
    coinFeeRateMap: {},
    symbolFeeRateMap: {},
  },
  upnlBasePrice: '2', // marketPrice
};

const types = {
  SET_USER_BASE_INFO: 'SET_USER_BASE_INFO',
  SET_USER_RATE: 'SET_USER_RATE',

  SET_USER_INFO: 'SET_USER_INFO',
  CLEAN_USER_INFO: 'CLEAN_USER_INFO',
  SET_USER_WALLET: 'SET_USER_WALLET',

  SET_EXCHANGE_RATE: 'SET_EXCHANGE_RATE',
  UPDATE_USER_WALLET: 'UPDATE_USER_WALLET',
  RESET_USER_WALLET: 'RESET_USER_WALLET',
  RESET_USER_LANGUAGE: 'RESET_USER_LANGUAGE',
  UPDATE_ORDER_CONFIRM: 'UPDATE_ORDER_CONFIRM',

  SET_CLOSE_POSITION_TIP_STATUS: 'SET_CLOSE_POSITION_TIP_STATUS',
  SET_CANCEL_ORDER_TIP_STATUS: 'SET_CANCEL_ORDER_TIP_STATUS',
  SET_BOOK_SYMBOL_PREFER_SETTING: 'SET_BOOK_SYMBOL_PREFER_SETTING',

  SET_ORDER_BOOK_SETTING: 'SET_ORDER_BOOK_SETTING',
  SET_PROFILE_API_LOADED: 'SET_PROFILE_API_LOADED',
  SET_AB_TEST_RESULT: 'SET_AB_TEST_RESULT',
  SET_ORDER_COIN_TYPE: 'SET_ORDER_COIN_TYPE', // 下单方式,正向：保证金|币种|usdt；反向 币种|usd
  SET_ORDER_TYPE: 'SET_ORDER_TYPE', // 下单类型，限价|市价|条件单
  SET_INVITES_INFO: 'SET_INVITES_INFO',
  SET_UPNL_BASE_PRICE: 'SET_UPNL_BASE_PRICE',
};

const actions = {
  [types.SET_USER_BASE_INFO](state, { userInfo }) {
    state[ns].userInfo = userInfo;
  },
  //  http设置用户钱包, 现货是所有币种的
  [types.SET_USER_WALLET](state, { payload }) {
    payload.forEach((item) => {
      state[ns].wallet[item.tokenId] = item;
    });
  },

  // ws设置用户钱包
  [types.UPDATE_USER_WALLET](state, { payload }) {
    payload.forEach((item) => {
      state[ns].wallet[item.tokenId] = item;
    });
  },

  // 以上都是现货新加的
  [types.SET_USER_RATE](state, { rateInfo }) {
    if (rateInfo) {
      state[ns].rateInfo = rateInfo;
    }
  },

  // [types.SET_INVITES_INFO](state, { invitesInfo }) {
  //   state[ns].invitesInfo = invitesInfo;
  // },
  // 记忆计算未结盈亏的价格
  [types.SET_UPNL_BASE_PRICE](state, { upnlBasePrice }) {
    state[ns].upnlBasePrice = upnlBasePrice;
    localStorage.setItem('UPNL_BASE_PRICE', upnlBasePrice);
  },
  // 记忆下单类型，限价|市价|条件单
  [types.SET_ORDER_TYPE](state, { orderType }) {
    state[ns].orderType = orderType;
    localStorage.setItem('orderType', orderType);
  },
  // 记忆当前下单方式  正向：保证金|币种|usdt；反向 币种|usd
  [types.SET_ORDER_COIN_TYPE](state, { orderCoinType }) {
    // 设置
    const key = 'SPOT_ORDER_COIN_TYPE';
    const val = orderCoinType;
    state[ns].orderCoinType = orderCoinType;
    const newStr = JSON.stringify(val);
    localStorage.setItem(key, newStr);
  },
  // 设置用户信息
  [types.SET_USER_INFO](state, { payload }) {
    let user_id = payload.id;
    if (!user_id) {
      user_id = payload.userId;
    }
    state[ns].info = { ...state[ns].info, ...payload, id: user_id };
    localStorage.setItem('REPORT_ID', user_id);
  },
  [types.SET_EXCHANGE_RATE](state, { payload }) {
    const { fiatList, currencyCode } = payload;
    const newFiatList = fiatList || state[ns].exchangeRate.fiatList;
    const code = currencyCode?.toUpperCase();
    const rate = newFiatList.filter((it) => it.symbol === code)[0]?.rate;
    state[ns].exchangeRate = {
      fiatList: newFiatList,
      currencyCode: code,
      rate,
    };
  },

  [types.CLEAN_USER_INFO](state) {
    // console.log(types.CLEAN_USER_INFO);
    state[ns].info.id = 0;
  },
  [types.RESET_USER_LANGUAGE](state, { lang }) {
    state[ns].language = lang;
    setLang(lang);
  },

  [types.UPDATE_ORDER_CONFIRM](state, { newDoubleConfirm }) {
    state[ns].info.double_confirm = newDoubleConfirm;
  },

  [types.RESET_USER_WALLET](state) {
    state[ns].wallet = {
      USDT: {
        equity: 0,
        assetBalance: 0,
        availableBalance: 0,
        usedMargin: 0,
        orderMargin: 0,
        positionMargin: 0,
        occClosingFee: 0,
        occFundingFee: 0,
        walletBalance: 0,
        unRealisedPnl: 0,
        realisedPnl: 0,
      },
    };
  },
  [types.SET_CLOSE_POSITION_TIP_STATUS](state, { status }) {
    state[ns].kline.closePositionTipStatus = status;
  },
  [types.SET_CANCEL_ORDER_TIP_STATUS](state, { status }) {
    state[ns].kline.cancelOrderTipStatus = status;
  },
  [types.SET_BOOK_SYMBOL_PREFER_SETTING](state, { status }) {
    state[ns].bookSymbolSetStatus = status;
  },

  [types.SET_ORDER_BOOK_SETTING](state, { status = '{}' }) {
    try {
      state[ns].orderBookSetting = JSON.parse(status);
    } catch (e) {
      state[ns].orderBookSetting = {};
    }
  },
  [types.SET_PROFILE_API_LOADED](state, { status }) {
    state[ns].info.profileApiLoaded = status;
  },
  [types.SET_AB_TEST_RESULT](state, { payload }) {
    state[ns].abTestResult = payload;
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
