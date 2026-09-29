const ns = 'bookSymbol';

const initStates = {
  bookedSymbolList: [],
};

const types = {
  SET_BOOK_SYMBOL_LIST: 'SET_BOOK_SYMBOL_LIST',
};

const actions = {
  [types.SET_BOOK_SYMBOL_LIST](state, { data }) {
    if (data && typeof data === 'string') {
      state[ns].bookedSymbolList = data.split(',');
      return;
    }
    state[ns].bookedSymbolList = [];
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
