// @ts-ignore
const ns = 'position';
const initStates = {
  // 当前委托
  currentEntrustList: {
    loaded: false,
    symbol: null,
    data: [],
  },
  // 历史委托
  historyEntrustList: {
    loaded: false,
    symbol: null,
    data: [],
  },
  // 成交明细
  dealList: {
    loaded: false,
    symbol: null,
    list: [],
  },
  // ===== 计划委托 子 tab 数据（新增） =====
  // 当前委托 - 计划委托
  currentPlanList: { loaded: false, symbol: null, data: [] },
  // 历史委托 - 计划委托
  historyPlanList: { loaded: false, symbol: null, data: [] },
  // ===== 止盈止损 子 tab 数据（独立接口化改造新增，plan_type=PROFIT_OR_STOP） =====
  // 当前委托 - 止盈止损
  currentTpslList: { loaded: false, symbol: null, data: [] },
  // 历史委托 - 止盈止损
  historyTpslList: { loaded: false, symbol: null, data: [] },
  openLimit: 1500000,
};

// 当前委托类列表（order/plan 共用）的 WS 增量更新：
// - 命中已有 orderId 且为终态（CANCELED/FILLED）：从列表移除
// - 命中已有 orderId 且为非终态：原地合并字段（覆盖编辑止盈止损等字段级更新，
// - 未命中且非终态：插入到最前面（视为新增）
// - 未命中且为终态：忽略（正常不应发生，安全兜底）
const TERMINAL_ORDER_STATUSES = ['CANCELED', 'FILLED'];

/** 当前委托列表项与 WS 推送项是否同一笔（orderId 或 plan_order_id/orderKey） */
function matchCurrentEntrustItem(item, data) {
  if (!item || !data) return false;
  if (
    item.orderId != null &&
    data.orderId != null &&
    item.orderId === data.orderId
  ) {
    return true;
  }
  const itemPlanId = item.plan_order_id ?? item.orderKey;
  const dataPlanId = data.plan_order_id ?? data.orderKey;
  return (
    itemPlanId != null &&
    dataPlanId != null &&
    String(itemPlanId) === String(dataPlanId)
  );
}

function upsertCurrentBucket(bucket, newList) {
  if (!bucket || !Array.isArray(newList) || newList.length === 0) return;
  const data = newList[0];
  if (!bucket.loaded) return;
  let prevData = bucket.data || [];
  if (prevData.length >= 100) {
    prevData = prevData.slice(0, 99);
  }
  const existingIndex = prevData.findIndex((item) =>
    matchCurrentEntrustItem(item, data),
  );
  const isTerminal = TERMINAL_ORDER_STATUSES.includes(data.status);
  if (existingIndex > -1) {
    if (isTerminal) {
      bucket.data = prevData.filter((_, i) => i !== existingIndex);
    } else {
      bucket.data = prevData.map((item, i) =>
        i === existingIndex ? { ...item, ...data } : item,
      );
    }
  } else if (!isTerminal) {
    bucket.data = [data, ...prevData];
  }
}

// 计划委托/止盈止损 历史委托类列表的 WS 增量更新：
// - 复用 matchCurrentEntrustItem 按 orderId 或 plan_order_id/orderKey 判断推送数据是否命中已有记录
// - 命中：原地合并更新字段，保持原有位置，不重复插入（修复同一笔订单多次终态推送导致的重复记录）
// - 未命中：插入到最前面（新增），保留 100 条上限截断逻辑
function updateHistoryBucket(bucket, newList) {
  if (!bucket || !Array.isArray(newList) || newList.length === 0) return;
  const data = newList[0];
  if (!bucket.loaded) return;
  const prevData = bucket.data || [];
  const existingIndex = prevData.findIndex((item) =>
    matchCurrentEntrustItem(item, data),
  );
  if (existingIndex > -1) {
    bucket.data = prevData.map((item, i) =>
      i === existingIndex ? { ...item, ...data } : item,
    );
    return;
  }
  let truncated = prevData;
  if (truncated.length >= 100) {
    truncated = truncated.slice(0, 99);
  }
  bucket.data = [data, ...truncated];
}

const types = {
  SET_POSITION_ORDER_LIST: 'SET_POSITION_ORDER_LIST',

  SET_CURRENT_ENTRUST_LIST: 'SET_CURRENT_ENTRUST_LIST',
  SET_HISTORY_ENTRUST_LIST: 'SET_HISTORY_ENTRUST_LIST',
  UPDATE_CURRENT_ENTRUST_LIST: 'UPDATE_CURRENT_ENTRUST_LIST',
  UPDATE_HISTORY_ENTRUST_LIST: 'UPDATE_HISTORY_ENTRUST_LIST',
  SET_MY_DEAL_LIST: 'SET_MY_DEAL_LIST,',
  UPDATE_MY_DEAL_LIST: 'UPDATE_MY_DEAL_LIST,',

  // 计划委托（新增）
  SET_CURRENT_PLAN_LIST: 'SET_CURRENT_PLAN_LIST',
  SET_HISTORY_PLAN_LIST: 'SET_HISTORY_PLAN_LIST',
  UPDATE_CURRENT_PLAN_LIST: 'UPDATE_CURRENT_PLAN_LIST',
  UPDATE_HISTORY_PLAN_LIST: 'UPDATE_HISTORY_PLAN_LIST',

  // 止盈止损（独立接口化改造新增）
  SET_CURRENT_TPSL_LIST: 'SET_CURRENT_TPSL_LIST',
  SET_HISTORY_TPSL_LIST: 'SET_HISTORY_TPSL_LIST',
  UPDATE_CURRENT_TPSL_LIST: 'UPDATE_CURRENT_TPSL_LIST',
  UPDATE_HISTORY_TPSL_LIST: 'UPDATE_HISTORY_TPSL_LIST',

  RESET_MY_POSITION_ORDER_LIST: 'RESET_MY_POSITION_ORDER_LIST,',
};

const actions = {
  // 新增 http设置 当前委托
  [types.SET_CURRENT_ENTRUST_LIST](state, payload) {
    const { data = {}, symbol } = payload;
    state[ns].currentEntrustList = {
      loaded: true,
      symbol,
      data,
    };
  },

  // 新增 http设置 历史委托
  [types.SET_HISTORY_ENTRUST_LIST](state, payload) {
    const { data = {}, symbol } = payload || {};
    state[ns].historyEntrustList = {
      loaded: true,
      symbol,
      data,
    };
  },

  // HTTP 设置成交明细
  [types.SET_MY_DEAL_LIST](state, payload) {
    const { list = [], symbol } = payload;
    state[ns].dealList = {
      loaded: true,
      symbol,
      list,
    };
  },
  // ws更新当前委托：新增/撤销/成交按 orderId 命中做插入或移除，
  // 编辑止盈止损等字段级更新（同一 orderId、非终态）则原地合并
  [types.UPDATE_CURRENT_ENTRUST_LIST](state, payload) {
    const newList = payload.list;
    if (!Array.isArray(newList) || newList.length === 0) return;
    if (newList[0].type === 'MARKET') return; // 市价单没有委托单数据，不更新当前委托列表
    upsertCurrentBucket(state[ns].currentEntrustList, newList);
  },

  // ws更新历史委托（限价/市价 order 家族）：新增（已成交/已撤销）。
  // 同一笔订单可能被后端多次推送终态（如触发成交后重复推送），复用带去重的
  // updateHistoryBucket 按 orderId 命中则原地合并、不再重复插入，避免历史列表重复展示。
  [types.UPDATE_HISTORY_ENTRUST_LIST](state, payload) {
    updateHistoryBucket(state[ns].historyEntrustList, payload.list);
  },

  // ws更新成交明细
  [types.UPDATE_MY_DEAL_LIST](state, payload) {
    const { list = [] } = payload;
    // console.log('ws.spot.deal_update1', payload);
    if (list.length === 0) return;
    const data = list[0];
    // 长度大于100，则减去一条数据
    const { list: originDealList, symbol, loaded } = state[ns].dealList;
    if (originDealList.length >= 100) {
      state[ns].dealList.list = [
        data,
        ...state[ns].dealList.list.splice(0, 99),
      ];
    } else {
      state[ns].dealList.list = [data, ...state[ns].dealList.list];
    }
  },

  // ===== 计划委托：HTTP 设置（新增） =====
  [types.SET_CURRENT_PLAN_LIST](state, payload) {
    const { data = [], symbol } = payload || {};
    state[ns].currentPlanList = { loaded: true, symbol, data };
  },
  [types.SET_HISTORY_PLAN_LIST](state, payload) {
    const { data = [], symbol } = payload || {};
    state[ns].historyPlanList = { loaded: true, symbol, data };
  },

  // ===== 计划委托：WS 增量更新（新增） =====
  // 当前委托类，与 UPDATE_CURRENT_ENTRUST_LIST 同构（插入/原地合并/移除），
  [types.UPDATE_CURRENT_PLAN_LIST](state, payload) {
    upsertCurrentBucket(state[ns].currentPlanList, payload.list);
  },
  // 历史委托类（新增到顶部）
  [types.UPDATE_HISTORY_PLAN_LIST](state, payload) {
    updateHistoryBucket(state[ns].historyPlanList, payload.list);
  },

  // ===== 止盈止损：HTTP 设置（新增） =====
  [types.SET_CURRENT_TPSL_LIST](state, payload) {
    const { data = [], symbol } = payload || {};
    state[ns].currentTpslList = { loaded: true, symbol, data };
  },
  [types.SET_HISTORY_TPSL_LIST](state, payload) {
    const { data = [], symbol } = payload || {};
    state[ns].historyTpslList = { loaded: true, symbol, data };
  },

  // ===== 止盈止损：WS 增量更新（新增） =====
  // 当前委托类，与 UPDATE_CURRENT_PLAN_LIST 同构（插入/原地合并/移除），
  [types.UPDATE_CURRENT_TPSL_LIST](state, payload) {
    upsertCurrentBucket(state[ns].currentTpslList, payload.list);
  },
  // 历史委托类（新增到顶部）
  [types.UPDATE_HISTORY_TPSL_LIST](state, payload) {
    updateHistoryBucket(state[ns].historyTpslList, payload.list);
  },

  // 个人推送：重置几种list
  [types.RESET_MY_POSITION_ORDER_LIST](state) {
    state[ns] = Object.assign(state[ns], {
      currentEntrustList: {
        loaded: false,
        symbol: null,
        data: [],
      }, // 当前委托
      historyEntrustList: {
        loaded: false,
        symbol: null,
        data: [],
      }, // 历史委托

      dealList: {
        loaded: false,
        symbol: null,
        list: [],
      }, // 成交明细
      // 计划委托（新增）
      currentPlanList: { loaded: false, symbol: null, data: [] },
      historyPlanList: { loaded: false, symbol: null, data: [] },
      // 止盈止损（独立接口化改造新增）
      currentTpslList: { loaded: false, symbol: null, data: [] },
      historyTpslList: { loaded: false, symbol: null, data: [] },
    });
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
