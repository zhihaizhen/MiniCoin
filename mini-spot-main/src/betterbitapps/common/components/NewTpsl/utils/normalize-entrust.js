/**
 * 委托列表项归一化与聚合判定（纯逻辑层）。
 *
 * 两类接口家族字段命名不同：
 * - order 家族（`order/*`）：camelCase，主键 `order_id`，已是 `baseTokenName` /
 *   `quoteTokenName` / `time` / `origQty` / `triggerPrice` / `profitPrice` / `stopPrice`。
 * - plan 家族（`plan_order/*`）：snake_case，主键 `plan_order_id`，字段为
 *   `symbol_id` / `base_token_id` / `quote_token_id` / `created_at` / `quantity` /
 *   `price` / `trigger_price` / `profit_price` / `stop_price`；历史列表另含
 *   `entrusted_value` / `submit_price` / `submit_quantity` / `deal_quantity` /
 *   `deal_value` / `avg_price`。
 *
 * 本模块统一归一为内部字段（`takeProfit` / `stopLoss` / `orderKey` / `isPlan` /
 * `time` / `origQty` / `triggerPrice` / `baseTokenName` / `quoteTokenName`），
 * 列表组件只需消费这些内部字段，无需感知接口家族差异。止盈止损默认值为字符串
 * "0"，判定「是否设置」统一用 `Number(value) > 0`。
 *
 * 所有函数均为纯函数，对缺失字段保持 undefined，不抛异常。
 */

/**
 * 接口家族枚举。
 * @typedef {'order' | 'plan'} EntrustFamily
 */

/**
 * 取某委托项的止盈触发价原值（按家族命名取值）。
 * @param {Object} item
 * @param {EntrustFamily} family
 * @returns {*} 止盈触发价原值（缺失时 undefined）
 */
function getProfitRaw(item, family) {
  if (!item) return undefined;
  return family === 'plan' ? item.profit_price : item.profitPrice;
}

/**
 * 取某委托项的止损触发价原值（按家族命名取值）。
 * @param {Object} item
 * @param {EntrustFamily} family
 * @returns {*} 止损触发价原值（缺失时 undefined）
 */
function getStopRaw(item, family) {
  if (!item) return undefined;
  return family === 'plan' ? item.stop_price : item.stopPrice;
}

/**
 * plan 家族与 order 家族相比，以下字段仅命名不同、语义一致，用别名表统一转换
 * （内部字段名 -> plan 家族原始字段名）。order 家族本身已是内部字段名，直接透传。
 */
const PLAN_FIELD_ALIAS = {
  time: 'created_at',
  origQty: 'quantity',
  triggerPrice: 'trigger_price',
  // 止盈止损触发价（与止盈止损价 profit_price/stop_price 不同）
  triggerProfitPrice: 'trigger_profit_price',
  triggerStopPrice: 'trigger_stop_price',
  // 历史列表成交/委托价值/实际委托（plan_order/history_orders）
  avgPrice: 'avg_price',
  executedQty: 'deal_quantity',
  executedAmount: 'deal_value',
  quoteAmount: 'entrusted_value',
  actualPrice: 'submit_price',
  actualQty: 'submit_quantity',
  side: 'order_side',
  type: 'order_type',
  orderId: 'order_id',
  // 历史止盈止损明细类型：TAKE_PROFIT / STOP_LOSS 等
  planTypeDetail: 'plan_type_detail',
};

/**
 * 历史字段多别名兜底（新旧接口并存过渡）。
 * key 为内部字段名，value 为在主别名取空后继续尝试的候选原始字段名。
 */
const PLAN_FIELD_FALLBACKS = {
  actualPrice: ['actual_price'],
  actualQty: ['actual_quantity', 'actual_qty'],
  quoteAmount: ['quote_amount'],
  executedQty: ['executed_qty'],
  executedAmount: ['executed_amount'],
};

/** 现货报价币种，PRD 固定 USDT（与 EditTpsl 组件 QUOTE_UNIT 保持一致）。 */
const PLAN_QUOTE_TOKEN = 'USDT';

/** 字段值是否视为空（null / undefined / 空串）。 */
function isEmptyValue(value) {
  return value == null || value === '';
}

/**
 * 按候选 key 顺序取第一个非空值；全部为空时返回最后一个候选的原值。
 * @param {Object} item
 * @param {string[]} keys
 * @returns {*}
 */
function pickFirstNonEmpty(item, keys) {
  let last;
  for (let i = 0; i < keys.length; i += 1) {
    last = item[keys[i]];
    if (!isEmptyValue(last)) return last;
  }
  return last;
}

/**
 * 解析 plan 家族某内部字段：优先同名内部字段 → 主别名 → 额外兜底别名。
 * @param {Object} item
 * @param {string} internalKey - 内部字段名
 * @param {string} aliasKey - plan 家族主别名
 * @returns {*}
 */
function resolvePlanAliasValue(item, internalKey, aliasKey) {
  const primary = item[internalKey] ?? item[aliasKey];
  if (!isEmptyValue(primary)) return primary;
  const fallbacks = PLAN_FIELD_FALLBACKS[internalKey];
  if (!fallbacks?.length) return primary;
  return pickFirstNonEmpty(item, fallbacks);
}

/**
 * 取某委托项的交易对展示名（按家族命名取值）。
 * order 家族已有 `baseTokenName` / `quoteTokenName`，直接透传；plan 家族优先
 * 使用 `base_token_id` / `quote_token_id`，缺失时再按 `symbol_id` 拆出。
 * @param {Object} item
 * @param {EntrustFamily} family
 * @returns {{baseTokenName: (string|undefined), quoteTokenName: (string|undefined)}}
 */
function getSymbolNamesRaw(item, family) {
  if (!item) return { baseTokenName: undefined, quoteTokenName: undefined };
  if (family !== 'plan') {
    return {
      baseTokenName: item.baseTokenName,
      quoteTokenName: item.quoteTokenName,
    };
  }
  // 优先使用接口直接返回的 base/quote token
  if (item.base_token_id) {
    return {
      baseTokenName: item.base_token_id,
      quoteTokenName: item.quote_token_id || PLAN_QUOTE_TOKEN,
    };
  }
  const symbolId = String(item.symbol_id || item.symbol_name || '').trim();
  if (!symbolId) {
    return { baseTokenName: undefined, quoteTokenName: PLAN_QUOTE_TOKEN };
  }
  if (
    symbolId.length > PLAN_QUOTE_TOKEN.length &&
    symbolId.endsWith(PLAN_QUOTE_TOKEN)
  ) {
    return {
      baseTokenName: symbolId.slice(0, -PLAN_QUOTE_TOKEN.length),
      quoteTokenName: PLAN_QUOTE_TOKEN,
    };
  }
  return { baseTokenName: symbolId, quoteTokenName: PLAN_QUOTE_TOKEN };
}

/**
 * 将单条委托列表项归一化为内部统一模型（不可变更新，不修改入参）。
 *
 * 追加内部字段：`isPlan` / `takeProfit` / `stopLoss` / `orderKey`（主键）/
 * `time` / `origQty` / `triggerPrice`（plan 家族按 `PLAN_FIELD_ALIAS` 取值，
 * 其余家族透传同名字段）/ `baseTokenName` / `quoteTokenName`（plan 家族由
 * `symbol_id` 拆出）。缺失字段保持 undefined，不抛异常。
 *
 * @param {Object} item - 接口返回的单条委托项
 * @param {EntrustFamily} family - 接口家族（'order' | 'plan'）
 * @returns {Object} 归一化后的内部模型；item 非对象时返回安全空对象
 */
export function normalizeEntrustItem(item, family) {
  const isPlan = family === 'plan';
  if (!item || typeof item !== 'object') {
    return {
      isPlan,
      takeProfit: undefined,
      stopLoss: undefined,
      orderKey: undefined,
    };
  }

  const planAliasFields = isPlan
    ? Object.fromEntries(
        Object.entries(PLAN_FIELD_ALIAS).map(([to, from]) => [
          to,
          resolvePlanAliasValue(item, to, from),
        ]),
      )
    : {};

  return {
    ...item,
    ...planAliasFields,
    ...getSymbolNamesRaw(item, family),
    isPlan,
    takeProfit: getProfitRaw(item, family),
    stopLoss: getStopRaw(item, family),
    orderKey: isPlan ? item.plan_order_id : item.order_id,
  };
}

/**
 * 判定某委托项是否设置了止盈止损（按家族命名取值且 `Number(value) > 0`）。
 * 任一侧大于 0 即视为已设置，对字符串 "0" / 空 / 缺失字段健壮。
 *
 * @param {Object} item - 委托项
 * @param {EntrustFamily} family - 接口家族（'order' | 'plan'）
 * @returns {boolean} 是否设置了止盈或止损
 */
export function hasTpsl(item, family) {
  const profit = Number(getProfitRaw(item, family));
  const stop = Number(getStopRaw(item, family));
  return (
    (Number.isFinite(profit) && profit > 0) ||
    (Number.isFinite(stop) && stop > 0)
  );
}

/**
 * 过滤并排序计划委托当前列表：仅保留状态为 WAITING 的项，并按 `plan_order_id`
 * 数值从大到小排列。纯函数，不修改入参。
 *
 * @param {Array<Object>} list - 计划委托当前列表
 * @returns {Array<Object>} 过滤排序后的新数组
 */
export function filterSortWaitingPlans(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => item && item.status === 'WAITING')
    .slice()
    .sort((a, b) => Number(b?.plan_order_id) - Number(a?.plan_order_id));
}

/**
 * 「仅当前交易对」过滤：onlyCurrent 开启时仅保留 `baseTokenName` 与传入 symbol
 * 相等的项，关闭时返回全集（浅拷贝）。纯函数，不修改入参。
 *
 * @param {Array<Object>} list - 委托列表
 * @param {*} symbol - 当前交易对标识（与列表项 baseTokenName 比较）
 * @param {boolean} onlyCurrent - 「仅当前交易对」开关是否开启
 * @returns {Array<Object>} 过滤后的新数组
 */
export function filterByCurrentSymbol(list, symbol, onlyCurrent) {
  if (!Array.isArray(list)) return [];
  if (!onlyCurrent) return list.slice();
  return list.filter((item) => item && item.baseTokenName === symbol);
}

/** 止盈止损操作入口文案 i18n key：编辑（已设置止盈止损）。 */
export const TPSL_ENTRY_EDIT_KEY = 'editTpsl';
/** 止盈止损操作入口文案 i18n key：添加（未设置止盈止损）。 */
export const TPSL_ENTRY_ADD_KEY = 'addTpsl';

/**
 * 派生止盈止损操作入口文案 i18n key：已设置（任一侧 > 0）返回「编辑」，否则返回「添加」。
 *
 * @param {Object} item - 委托项
 * @param {EntrustFamily} family - 接口家族（'order' | 'plan'）
 * @returns {string} i18n key（TPSL_ENTRY_EDIT_KEY / TPSL_ENTRY_ADD_KEY）
 */
export function getTpslEntryText(item, family) {
  return hasTpsl(item, family) ? TPSL_ENTRY_EDIT_KEY : TPSL_ENTRY_ADD_KEY;
}
