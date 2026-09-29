import { reverseModel } from '../common/model';
import {
  ORDER_ACTION,
  POSITION_MODE
} from '../common/packages-biz/by-global-settings/usdt-settings';
// import {
//   deleteTraceIdTracking,
//   getTraceIdStart
// } from '../common/utils/http-interceptor';

import {
  processOrder,
  parseOrderList,
  processPositionItem,
  filterPosition
} from '../services/copyTrading.service';
import { cloneDeep } from 'lodash';
import { ECopyTradingOrderStatus } from '../common/enums/order.enum';

const ns = 'position';

const activityOrderStatusList = [
  ECopyTradingOrderStatus.New,
  ECopyTradingOrderStatus.OpenOrderPartiallyFilled
];
const filledOrderStatusList = [
  ECopyTradingOrderStatus.OpenOrderPartiallyFilled,
  ECopyTradingOrderStatus.OpenOrderFilled,
  ECopyTradingOrderStatus.OpenOrderClosing
];

const initStates = {
  positionList: {
    loaded: false,
    list: []
  },
  activityList: {
    loaded: false,
    symbol: null,
    list: []
  },
  conditionsList: {
    loaded: false,
    symbol: null,
    list: []
  },
  historyList: {
    loaded: false,
    symbol: null,
    list: []
  },
  dealList: {
    loaded: false,
    symbol: null,
    list: []
  },
  profitList: {
    loaded: false,
    symbol: null,
    list: []
  },
  tpslList: {
    loaded: false,
    symbol: null,
    data: {
      Buy: [],
      Sell: []
    }
  },
  copyTrading: {
    // 带单明细和委托单共用
    currentOrder: {
      loaded: false,
      list: []
    },
    // 当前带单（汇总）
    currentPosition: {
      loaded: false,
      list: []
    },
    // 当前带单（明细）
    currentPositionDetail: {
      loaded: false,
      list: []
    },
    // 委托订单
    currentActiveList: {
      loaded: false,
      list: []
    },
    historyList: {
      loaded: false,
      list: []
    },
    leverageConfigList: [],
    currentOrderSummaryFilterSymbol: '', // 当前带单汇总选中symbol
    currentOrderFilterSymbol: '', // 当前带单明细选中symbol
    currentHistoryOrderFilterSymbol: '',
    positionInfoConfig: [],
    allSymbols: [] // 全量symbol，支持copyTrading交易的symbol
  },
  openLimit: 1500000
};

const types = {
  SET_LEVERAGE: 'setLeverage',
  SET_MODE: 'setMode',
  SET_OPEN_LIMIT: 'setOpenLimit',
  SET_POSITION_MODE: 'setPositionMode',
  SET_POSITION_LIST: 'SET_POSITION_LIST',
  SET_POSITION_ORDER_LIST: 'SET_POSITION_ORDER_LIST',
  SET_POSITION_TP_SL_LIST: 'SET_POSITION_TP_SL_LIST', // 止盈止损列表
  UPDATE_POSITION_LIST: 'UPDATE_POSITION_LIST',
  UPDATE_POSITION_ORDER_LIST: 'UPDATE_POSITION_ORDER_LIST',
  UPDATE_POSITION_TP_SL_LIST: 'UPDATE_POSITION_TP_SL_LIST',
  INSERT_MY_DEAL_LIST: 'INSERT_MY_DEAL_LIST,',
  RESET_MY_POSITION_ORDER_LIST: 'RESET_MY_POSITION_ORDER_LIST,',
  SET_PROFITLIST: 'SET_PROFITLIST,',
  INSERT_PROFIT_LIST: 'INSERT_PROFIT_LIST,',
  SET_CPT_CURRENT_POSITION_SUMMARY: 'SET_CPT_CURRENT_POSITION_SUMMARY',
  SET_CPT_CURRENT_POSITION_DETAIL: 'SET_CPT_CURRENT_POSITION_DETAIL',
  SET_CPT_ACTIVE_LIST: 'SET_CPT_ACTIVE_LIST',
  SET_CPT_HISTORY_LIST: 'SET_CPT_HISTORY_LIST',
  UPDATE_CPT_POSITION: 'UPDATE_CPT_POSITION',
  UPDATE_CPT_WS_ORDER: 'UPDATE_CPT_WS_ORDER',
  UPDATE_CPT_WS_POSITION: 'UPDATE_CPT_WS_POSITION',
  UPDATE_POSITION_FILTER_SYMBOL_SUMMARY:
    'UPDATE_POSITION_FILTER_SYMBOL_SUMMARY', // 按汇总筛选当前带单合约symbol
  UPDATE_POSITION_FILTER_SYMBOL_DETAIL: 'UPDATE_POSITION_FILTER_SYMBOL_DETAIL', // 按明细筛选当前带单合约symbol
  UPDATE_HISTORY_ORDER_FILTER_SYMBOL: 'UPDATE_HISTORY_ORDER_FILTER_SYMBOL', // 选中的历史订单symbol
  SET_CPT_LEVERAGE_CONFIG: 'SET_CPT_LEVERAGE_CONFIG'
};

const actions = {
  /**
   * Set global position mode
   *  possible value:
   *    - 'Cross'
   *    - `Isolate`
   *
   * @param {object} state The Draft state
   * @param {object} action The operation action with data
   */
  [types.SET_POSITION_MODE](state, action) {
    const { symbol } = state;
    state[ns].positionList.list
      .filter((it) => it.symbol === symbol)
      .forEach((it) => {
        it.isIsolated = action.mode === POSITION_MODE.ISOLATE;
      });
  },

  /**
   * Set global maximum risk limit
   *
   * @param {object} state The Draft state
   * @param {object} action The operation action with data
   */
  [types.SET_OPEN_LIMIT](state, action) {
    const { symbol } = state;
    state[ns].positionList.list
      .filter((it) => it.symbol === symbol)
      .forEach((it) => {
        it.openValueLimit = action.openLimit;
      });
  },

  /**
   * Set global leverage
   *
   * @param {object} state The Draft state
   * @param {object} action The operation action with data
   */
  [types.SET_LEVERAGE](state, { buyLeverage, sellLeverage }) {
    const { symbol } = state;
    state[ns].positionList.list
      .filter((it) => it.symbol === symbol)
      .find(({ side }) => side === ORDER_ACTION.BUY).leverage = buyLeverage;
    state[ns].positionList.list
      .filter((it) => it.symbol === symbol)
      .find(({ side }) => side === ORDER_ACTION.SELL).leverage = sellLeverage;
  },

  /**
   * Set position mode
   * @param {object} state The Draft state
   * @param {object} mode The new mode
   */
  [types.SET_MODE](state, { mode }) {
    const { symbol } = state;
    state[ns].positionList.list
      .filter((it) => it.symbol === symbol)
      .forEach((item) => {
        item.mode = mode;
      });
  },

  // 首次插入仓位列表(接口)
  [types.SET_POSITION_LIST](state, payload) {
    const { list = [], reverseList = [] } = payload;
    const newList = list
      .filter((item) => item.isAvailable)
      .map(({ isAvailable, data = {} }) => ({
        isAvailable,
        // mode: MODE_TYPE.MODE_BOTH,
        ...reverseModel.position(data)
      }));
    const newReverseList = reverseList
      .filter((item) => item.isAvailable)
      .map(({ isAvailable, data = {} }) => ({
        isAvailable,
        ...reverseModel.position(data)
      }));
    state[ns].positionList = {
      loaded: true,
      symbol: payload.symbol,
      list: [...newList, ...newReverseList]
    };
  },
  // 更新持仓列表
  [types.UPDATE_POSITION_LIST](state, payload) {
    const newList = payload.list || [];
    if (newList.length === 0) return;
    const { loaded } = state[ns].positionList;
    if (!loaded) return; // 如果没从接口获取过数据 return
    newList.forEach((data) => {
      const newData = reverseModel.position(data);
      const index = state[ns].positionList.list.findIndex((item) => {
        return (
          item.symbol === data.symbol &&
          Number(item.positionIdx) === Number(data.positionIdx)
        );
      });
      // 推送 isAvailable 默认为true
      // 新推的仓位直接放到最前面（因为获取单双仓模式时是以第一个为准的） // 推送 isAvailable 默认为true
      state[ns].positionList.list = [
        {
          ...newData,
          isAvailable: true
        }
      ].concat(state[ns].positionList.list);
      // 如果这个仓位原来存在，删除原来的
      if (index !== -1) {
        state[ns].positionList.list.splice(index + 1, 1);
      }
    });
  },

  // 首次插入列表(接口) 活动委托、条件委托、委托历史
  [types.SET_POSITION_ORDER_LIST](state, payload) {
    const { list, symbol, insertType } = payload;
    const newList = (list || []).map((item) => reverseModel.order(item));
    state[ns][`${insertType}List`] = {
      loaded: true,
      symbol,
      list: newList
    };
  },

  // 首次插入列表(接口) 止盈止损
  [types.SET_POSITION_TP_SL_LIST](state, payload) {
    let newList = [];
    if (payload.list && Array.isArray(payload.list)) {
      payload.list
        .filter((it) => it.isAvailable)
        .forEach(({ data = [] }) => {
          newList = [
            ...newList,
            ...data.map((item) => reverseModel.order(item))
          ];
        });
    }
    if (payload.reverseTpsl && Array.isArray(payload.reverseTpsl)) {
      payload.reverseTpsl
        .filter((it) => it.isAvailable)
        .forEach(({ data = [] }) => {
          newList = [
            ...newList,
            ...data.map((item) => reverseModel.order(item))
          ];
        });
    }
    if (newList.length === 0) {
      state[ns].tpslList = {
        loaded: true,
        symbol: payload.symbol,
        data: {
          Buy: [],
          Sell: []
        }
      };
    } else {
      const data = newList[0];
      // const { symbol } = state[ns].tpslList;
      // if (symbol && symbol !== data.symbol) return; // 如果币种不一致 return
      const [sellList, buyList] = [[], []]; // sell 和 buy 保持跟订单一致，跟持仓相反
      newList.forEach((tpsl) => {
        if (tpsl.side === ORDER_ACTION.BUY) {
          buyList.push(tpsl);
        } else if (tpsl.side === ORDER_ACTION.SELL) {
          sellList.push(tpsl);
        }
      });
      state[ns].tpslList = {
        loaded: true,
        symbol: data.symbol,
        data: {
          Buy: buyList,
          Sell: sellList
        }
      };
    }
  },

  // 个人推送：止盈止损
  // 更新 止盈止损｜委托历史 推送数据(insert｜update｜delete)
  [types.UPDATE_POSITION_TP_SL_LIST](state, payload) {
    // ws2.5 止盈止损字段映射
    const newList = (payload.list || []).map((item) =>
      reverseModel.order(item)
    );
    if (newList.length === 0) return;
    newList.forEach((data) => {
      if (data.stopOrderType) {
        const {
          data: { Buy, Sell },
          loaded
        } = state[ns].tpslList;
        if (!loaded) return; // 如果没从接口获取过数据 return
        const list = data.side === ORDER_ACTION.BUY ? Buy : Sell;
        const index = list.findIndex((item) => item.orderId === data.orderId);
        if (data.isWorking) {
          // update & insert
          if (index !== -1) {
            // 如果数据已经存在，则修改对应的那条数据
            state[ns].tpslList.data[data.side][index] = Object.assign(
              list[index],
              data
            );
          } else {
            state[ns].tpslList.data[data.side] = [data].concat(list); // 新数据放在前面
          }
        } else if (index !== -1) {
          // isActive==false && 存在此条信息
          // delete
          state[ns].tpslList.data[data.side].splice(index, 1);
        }
      }
      // 更新委托历史数据
      const { list, symbol, loaded } = state[ns].historyList;
      if (!loaded || symbol !== data.symbol) return; // 如果没从接口获取过数据或者币种不一致 return
      const index = list.findIndex((item) => item.orderId === data.orderId);
      if (index !== -1) {
        // 如果数据已经存在，则修改对应的那条数据
        state[ns].historyList.list[index] = Object.assign(list[index], data);
      } else {
        state[ns].historyList.list = [data].concat(list); // 新数据放在前面
      }
    });
  },

  // 个人推送：活动委托、条件委托、委托历史、止盈止损
  // 更新活动｜条件委托｜委托历史推送数据(insert｜update｜delete)
  [types.UPDATE_POSITION_ORDER_LIST](state, payload) {
    const newList = (payload.list || []).map((item) =>
      reverseModel.order(item)
    );
    if (newList.length === 0) return;
    const data = newList[0];
    if (data.type) {
      // 下单链路埋点
      const clientTag = data.clientFlag;
      // if (clientTag) {
      //   const clientTagObj = getTraceIdStart(clientTag);
      //   if (clientTagObj) {
      //     const createOrderDuration = performance.now() - clientTagObj.start;

      //   }
      // }

      const type = data.type.toLowerCase();
      const { list, symbol, loaded } = state[ns][`${type}List`] ?? {};
      if (!loaded) return; // 如果没从接口获取过数据或者币种不一致 return
      const index = list.findIndex((item) => item.orderId === data.orderId);
      if (data.isWorking) {
        // update & insert
        if (index !== -1) {
          // 如果数据已经存在，则修改对应的那条数据
          state[ns][`${type}List`].list[index] = Object.assign(
            list[index],
            data
          );
        } else if (data.symbol === symbol) {
          // 当前symbol新数据放在前面
          state[ns][`${type}List`].list = [data].concat(list);
        } else {
          const res = state[ns][`${type}List`].list.filter(
            (item) => item.symbol === symbol
          );
          state[ns][`${type}List`].list.splice(res.length, 0, data);
        }
      } else if (index !== -1) {
        // isActive==false && 存在此条信息
        // delete
        state[ns][`${type}List`].list.splice(index, 1);
      }
    }
    // 更新委托历史数据
    const { list, symbol, loaded } = state[ns].historyList;
    if (!loaded || symbol !== data.symbol) return; // 如果没从接口获取过数据或者币种不一致 return
    const index = list.findIndex((item) => item.orderId === data.orderId);
    if (index !== -1) {
      // 如果数据已经存在，则修改对应的那条数据
      state[ns].historyList.list[index] = Object.assign(list[index], data);
    } else {
      state[ns].historyList.list = [data].concat(list); // 新数据放在前面
    }
  },

  // 个人推送：我的成交
  // 更新已成交的推送数据
  [types.INSERT_MY_DEAL_LIST](state, payload) {
    // ws2.5 excution字段映射
    const newList = (payload.list || []).map((item) =>
      reverseModel.execution(item)
    );
    const { list, symbol } = state[ns].dealList;
    state[ns].dealList.loaded = true;
    if (newList.length === 0) {
      if (payload.option === 'insert') {
        state[ns].dealList = {
          loaded: true,
          symbol: payload.symbol,
          list: []
        };
      }
      return; // 如果没从接口获取过数据 return
    }
    newList.forEach((data) => {
      if (symbol && symbol !== data.symbol) return;
      const index = list.findIndex(
        (item) => item.execId === data.execId && item.side === data.side
      );
      if (index !== -1) {
        state[ns].dealList.list[index] = Object.assign(
          state[ns].dealList.list[index],
          data
        );
      } else if (payload.option === 'insert') {
        state[ns].dealList = {
          loaded: true,
          symbol: data.symbol,
          list: state[ns].dealList?.list.concat([data])
        };
      } else {
        state[ns].dealList.list = [data].concat(state[ns].dealList.list);
      }
    });
  },

  [types.SET_PROFITLIST](state, payload) {
    const list = payload.list || [];
    state[ns].profitList = {
      loaded: true,
      symbol: payload.symbol,
      list: list.map((raw) => reverseModel.closedPnl(raw))
    };
  },
  [types.INSERT_PROFITLIST](state, payload) {
    const { list, symbol } = state[ns].profitList;
    const newList = payload.list || [];
    if (newList.length === 0) return; // 如果没从接口获取过数据 return
    newList.forEach((raw) => {
      const data = reverseModel.closedPnl(raw);
      if (symbol && symbol !== data.symbol) return;
      const index = list.findIndex(
        (item) => item && item.orderId === data.orderId
      );
      if (index > -1) {
        // update
        state[ns].profitList.list[index] = {
          ...state[ns].profitList.list[index],
          ...data
        };
      } else {
        // insert
        state[ns].profitList.list.unshift(data);
      }
    });
    state[ns].profitList.list = state[ns].profitList.list.slice(0, 19);
  },

  // 个人推送：重置几种list
  [types.RESET_MY_POSITION_ORDER_LIST](state) {
    state[ns] = Object.assign(state[ns], {
      historyList: {
        loaded: false,
        symbol: null,
        list: []
      }, // 委托历史
      dealList: {
        loaded: false,
        symbol: null,
        list: []
      }, // 已成交
      conditionsList: {
        loaded: false,
        symbol: null,
        list: []
      },
      activityList: {
        loaded: false,
        symbol: null,
        list: []
      },
      positionList: {
        loaded: false,
        symbol: null,
        list: []
      },
      profitList: {
        loaded: false,
        symbol: null,
        list: []
      },
      tpslList: {
        loaded: false,
        symbol: null,
        data: {
          Buy: [],
          Sell: []
        }
      }
    });
  },

  // copy trading订单更新
  [types.SET_CPT_CURRENT_POSITION_SUMMARY](state, { payload }) {
    state[ns].copyTrading = {
      ...state[ns].copyTrading,
      currentPosition: {
        list: payload,
        loaded: true
      }
    };
  },
  [types.SET_CPT_CURRENT_POSITION_DETAIL](state, { payload }) {},
  [types.SET_CPT_ACTIVE_LIST](state) {},
  [types.SET_CPT_HISTORY_LIST](state) {},
  [types.UPDATE_CPT_POSITION](state, { payload }) {
    state[ns].copyTrading = {
      ...state[ns].copyTrading,
      ...payload
    };
  },
  [types.UPDATE_CPT_WS_ORDER](state, { payload }) {
    const orderList = (payload?.data || []).map((item) => processOrder(item));
    const currentOrder = state[ns].copyTrading.currentOrder.list || [];
    const { currentOrderFilterSymbol } = state[ns].copyTrading;

    if (orderList.length > 0) {
      Object.keys(currentOrder).forEach((key) => {
        if (currentOrder[key]) {
          if (currentOrder[key]?.data) {
            const orderListItem = cloneDeep(currentOrder[key].data);
            orderList.forEach((v1) => {
              const matchIndex = orderListItem.findIndex(
                (v2) => v1.orderId === v2.orderId
              );
              if (matchIndex !== -1) {
                if (
                  key === 'activity' &&
                  !activityOrderStatusList.includes(v1.status)
                ) {
                  orderListItem.splice(matchIndex, 1);
                } else if (
                  key === 'filled' &&
                  !filledOrderStatusList.includes(v1.status)
                ) {
                  orderListItem.splice(matchIndex, 1);
                } else {
                  orderListItem[matchIndex] = {
                    ...orderListItem[matchIndex],
                    ...v1
                  };
                }
              } else {
                if (
                  key === 'activity' &&
                  activityOrderStatusList.includes(v1.status)
                ) {
                  orderListItem.unshift(v1);
                }
                if (
                  key === 'filled' &&
                  filledOrderStatusList.includes(v1.status)
                ) {
                  orderListItem.unshift(v1);
                }
              }
            });
            currentOrder[key].data = orderListItem;
          }
        }
      });
      const result = parseOrderList(currentOrder, currentOrderFilterSymbol);
      state[ns].copyTrading = {
        ...state[ns].copyTrading,
        ...result
      };
    }
  },
  [types.UPDATE_CPT_WS_POSITION](state, { payload }) {
    let currentPosition = state[ns].copyTrading.currentPosition.list || [];
    const { positionInfoConfig } = state[ns].copyTrading;
    const { currentOrderSummaryFilterSymbol } = state[ns].copyTrading;
    const positionList = (payload?.data || []).map((item) =>
      processPositionItem(item)
    );

    if (positionList.length > 0) {
      // positionList 信息更新
      positionList.forEach((v1) => {
        const matchIndex = currentPosition.findIndex(
          (v2) => v1.symbol === v2.symbol && v1.positionIdx === v2.positionIdx
        );
        if (matchIndex !== -1) {
          currentPosition[matchIndex] = {
            ...currentPosition[matchIndex],
            ...v1
          };
        } else {
          currentPosition = [v1, ...currentPosition];
        }

        // positionInfo 信息更新
        positionInfoConfig.forEach((item, index) => {
          if (
            item.symbol === v1.symbol &&
            item.positionIdx === v1.positionIdx
          ) {
            const {
              leverage,
              riskId,
              mode,
              isIsolated,
              buyValueToCost,
              sellValueToCost
            } = v1;
            positionInfoConfig[index] = {
              ...item,
              leverage,
              riskId,
              mode,
              isIsolated,
              buyValueToCost,
              sellValueToCost
            };
          }
        });
      });
      state[ns].copyTrading = {
        ...state[ns].copyTrading,
        positionInfoConfig,
        currentPosition: {
          loaded: true,
          list: filterPosition(currentPosition, currentOrderSummaryFilterSymbol)
        }
      };
    }
  },
  [types.UPDATE_POSITION_FILTER_SYMBOL_DETAIL](state, { payload }) {
    const { symbol } = payload;

    state[ns].copyTrading = {
      ...state[ns].copyTrading,
      currentOrderFilterSymbol: symbol
    };
  },
  [types.UPDATE_POSITION_FILTER_SYMBOL_SUMMARY](state, { payload }) {
    const { symbol } = payload;

    state[ns].copyTrading = {
      ...state[ns].copyTrading,
      currentOrderSummaryFilterSymbol: symbol
    };
  },
  [types.UPDATE_HISTORY_ORDER_FILTER_SYMBOL](state, { payload }) {
    const { symbol } = payload;

    state[ns].copyTrading = {
      ...state[ns].copyTrading,
      currentHistoryOrderFilterSymbol: symbol
    };
  },
  [types.SET_CPT_LEVERAGE_CONFIG](state, { payload }) {
    state[ns].copyTrading.leverageConfigList = payload;
  }
};

export default {
  ns,
  initStates,
  types,
  actions
};
