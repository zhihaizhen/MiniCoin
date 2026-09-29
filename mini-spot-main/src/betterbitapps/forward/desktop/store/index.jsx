import React, { createContext, useReducer, useContext, useRef } from 'react';
import produce from 'immer';
import PropTypes from 'prop-types';

import store from './store';

import globalStore from './global.store';
import positionStore from './position.store';
import instrumentStore from './instrument.store';
import userStore from './user.store';
import bookSymbolStore from './bookSymbol.store';
import guidanceStore from './guidance.store';

const GlobalStateContext = createContext();

const initState = {
  ...globalStore.initStates,
  [positionStore.ns]: positionStore.initStates,
  [instrumentStore.ns]: instrumentStore.initStates,
  [userStore.ns]: userStore.initStates,
  [bookSymbolStore.ns]: bookSymbolStore.initStates,
  [guidanceStore.ns]: guidanceStore.initStates,
  
};

export const types = {
  ...globalStore.types,
  ...positionStore.types,
  ...instrumentStore.types,
  ...userStore.types,
  ...bookSymbolStore.types,
  ...guidanceStore.types,
};

/**
 * combined actions
 */
const actions = {
  ...globalStore.actions,
  ...positionStore.actions,
  ...instrumentStore.actions,
  ...userStore.actions,
  ...bookSymbolStore.actions,
  ...guidanceStore.actions,
};

/**
 * Global common reducer
 */
const globalStateReducer = produce((draft, action) =>
  actions?.[action.type]?.(draft, action),
);

export const GlobalStateProvider = ({ children, initState: lazyInitState }) => {
  const fullState = { ...initState, ...lazyInitState };
  const refState = useRef(fullState);
  const [state, dispatch] = useReducer(globalStateReducer, fullState);

  refState.current = state;

  if (!store.isReady) {
    store.isReady = true;
    store.dispatch = (params) => dispatch(params);
    Object.freeze(store);
  }

  return (
    <GlobalStateContext.Provider value={[state, dispatch, refState]}>
      {children}
    </GlobalStateContext.Provider>
  );
};

GlobalStateProvider.defaultProps = {
  children: undefined,
  initState: {},
};

GlobalStateProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  initState: PropTypes.object,
};

export const useGlobalState = () => useContext(GlobalStateContext);
