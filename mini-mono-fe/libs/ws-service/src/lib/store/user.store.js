import { linearModel } from '../common/model';
import { COINS } from '../common/packages-biz/by-global-settings';
import { getLang, setLang } from '../common/utils/storageData';

const ns = 'user';

const initStates = {
  info: {
    id: 0,
    profileApiLoaded: false,
    is_copy_trading_leader: false
  },
  token: '',
  language: getLang(),
  riskLimit: [],
  wallet: {
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
      cumRealisedPnl: 0,
      givenCash: 0,
      serviceCash: 0
    }
  },
  copyTrading: {
    subMemberId: '',
    parentMemberId: '',
    wallet: {
      availableBalanceE8: '0',
      netProfitE8: '0',
      walletBalanceE8: '0'
    }
  },
  kline: {
    closePositionTipStatus: 'show', // 二次弹窗设置--快捷平仓，k线使用
    cancelOrderTipStatus: 'show', // 二次弹窗设置--快捷取消，k线使用，设置是否需要快捷取消弹窗确认
    reverseClickTipStatus: 'show' // 二次弹窗设置--快捷反手，k线使用
  },
  exchangeRate: {
    currencyCode: 'USD',
    rate: 1
  }, // 汇率和法币单位
  bookSymbolSetStatus: 'bookSymbolChangeRateSet', // 设置交易对收藏栏展示风格，根据涨跌幅或者最新市价展示
  // orderBook设置
  orderBookSetting: {
    quickOperate: 'hide'
  }, // 默认关闭
  abTestResult: {}
};

const types = {
  SET_USER_INFO: 'SET_USER_INFO',
  CLEAN_USER_INFO: 'CLEAN_USER_INFO',
  SET_USER_WALLET: 'SET_USER_WALLET',
  SET_USER_COPY_TRADING_WALLET: 'SET_USER_COPY_TRADING_WALLET',
  SET_USER_COPY_TRADING_INFO: 'SET_USER_COPY_TRADING_INFO',
  UPDATE_USER_COPY_TRADING_WALLET: 'UPDATE_USER_COPY_TRADING_WALLET',
  SET_EXCHANGE_RATE: 'SET_EXCHANGE_RATE',
  UPDATE_USER_WALLET: 'UPDATE_USER_WALLET',
  RESET_USER_WALLET: 'RESET_USER_WALLET',
  RESET_USER_LANGUAGE: 'RESET_USER_LANGUAGE',
  UPDATE_ORDER_CONFIRM: 'UPDATE_ORDER_CONFIRM',
  SET_USER_RISK_LIMIT: 'SET_USER_RISK_LIMIT',
  SET_CLOSE_POSITION_TIP_STATUS: 'SET_CLOSE_POSITION_TIP_STATUS',
  SET_CANCEL_ORDER_TIP_STATUS: 'SET_CANCEL_ORDER_TIP_STATUS',
  SET_BOOK_SYMBOL_PREFER_SETTING: 'SET_BOOK_SYMBOL_PREFER_SETTING',
  SET_REVERSE_CLICK_TIP_STATUS: 'SET_REVERSE_CLICK_TIP_STATUS',
  SET_ORDER_BOOK_SETTING: 'SET_ORDER_BOOK_SETTING',
  SET_PROFILE_API_LOADED: 'SET_PROFILE_API_LOADED',
  SET_AB_TEST_RESULT: 'SET_AB_TEST_RESULT'
};

const actions = {
  [types.SET_USER_INFO](state, { payload }) {
    // console.log(types.SET_USER_INFO);
    let user_id = payload.id;
    if (!user_id) {
      user_id = payload.userId;
    }
    state[ns].info = { ...state[ns].info, ...payload, id: user_id };
  },
  [types.SET_EXCHANGE_RATE](state, { payload }) {
    state[ns].exchangeRate = payload;
  },
  [types.SET_USER_RISK_LIMIT](state, { payload = [] }) {
    state[ns].riskLimit = payload;
  },
  [types.CLEAN_USER_INFO](state) {
    // console.log(types.CLEAN_USER_INFO);
    state[ns].info.id = 0;
  },
  [types.RESET_USER_LANGUAGE](state, { lang }) {
    state[ns].language = lang;
    setLang(lang);
  },
  // api
  [types.SET_USER_WALLET](state, { payload }) {
    state[ns].wallet = payload.reduce((obj, item) => {
      let { data } = item;
      if (item.isAvailable && data?.coin) {
        data = data.coin === COINS.USDT ? linearModel.wallet(data) : data; // 正向使用model
        return {
          ...obj,
          [data.coin]: data
        };
      }
      return obj;
    }, {});
  },
  [types.UPDATE_USER_WALLET](state, { payload }) {
    if (Array.isArray(payload)) {
      // ws
      payload
        ?.map((data) => ({
          ...data,
          isAvailable: true
        }))
        ?.forEach((item) => {
          const data =
            item.coin === COINS.USDT ? linearModel.wallet(item) : item; // 正向使用model
          state[ns].wallet[item.coin] = state[ns].wallet[item.coin]
            ? {
                ...state[ns].wallet[item.coin],
                ...data
              }
            : data;
        });
    }
  },
  [types.SET_USER_COPY_TRADING_WALLET](state, { payload }) {
    if (payload?.availableBalanceE8) {
      state[ns].copyTrading.wallet = {
        ...state[ns].copyTrading.wallet,
        ...payload
      };
    }
  },
  [types.SET_USER_COPY_TRADING_INFO](state, { payload }) {
    if (Object.prototype.toString.call(payload) === '[object Object]') {
      state[ns].copyTrading = {
        ...state[ns].copyTrading,
        ...payload
      };
    }
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
        cumRealisedPnl: 0,
        givenCash: 0,
        serviceCash: 0
      }
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
  [types.SET_REVERSE_CLICK_TIP_STATUS](state, { status }) {
    state[ns].kline.reverseClickTipStatus = status;
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
  }
};

export default {
  ns,
  initStates,
  types,
  actions
};
