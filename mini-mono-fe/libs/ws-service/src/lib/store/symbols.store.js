const ns = 'symbols';

const initStates = {
  totalSymbolList: {}, // 所有币对列表，通过 index.jsx 入口文件 setAppStatus 设置的
  // tag定制化，走自己的接口
  symbolTags: {
    allTags: '',
    tagsList: [],
  },
};

const types = {
  SET_SYMBOL_LIST: 'SET_SYMBOL_LIST',
  SET_SYMBOL_TAGS: 'SET_SYMBOL_TAGS',
};

const actions = {
  [types.SET_SYMBOL_LIST](state, { payload }) {
    state[ns].totalSymbolList = payload;
  },
  // tag定制化，走自己的接口
  [types.SET_SYMBOL_TAGS](state, { payload = initStates.symbolTags }) {
    state[ns].symbolTags = payload;
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
