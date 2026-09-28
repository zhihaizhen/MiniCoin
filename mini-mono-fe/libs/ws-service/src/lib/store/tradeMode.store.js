const ns = 'tradeMode';

const initStates = {
  currentTradeMode: 'personalTrading',
};

const types = {
  SET_CURRENT_TRADE_MODE: 'SET_CURRENT_TRADE_MODE',
};

const actions = {
  [types.SET_CURRENT_TRADE_MODE](state, { mode }) {
    // 暂时屏蔽指引
    state[ns].currentTradeMode = mode;
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
