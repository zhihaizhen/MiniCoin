const ns = 'symbolTemp';

const initStates = {
  symbolTempList: [],
};

const types = {
  SET_SYMBOL_TEMP_LIST: 'SET_SYMBOL_TEMP_LIST',
};

const actions = {
  [types.SET_SYMBOL_TEMP_LIST](state, payload) {
    state[ns].symbolTempList = payload.data;
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
