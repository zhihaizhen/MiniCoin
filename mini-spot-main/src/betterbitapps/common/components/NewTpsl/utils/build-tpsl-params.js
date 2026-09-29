import { TP_SL_FORM_FIELDS } from 'common/packages-biz/global-settings/usdt-settings';

/**
 * 判断止盈止损触发价字段是否为空（空字符串 / null / undefined 视为空）。
 * @param {*} value
 * @returns {boolean}
 */
function isTriggerEmpty(value) {
  return value === undefined || value === null || value === '';
}

/**
 * 两类接口家族的止盈止损字段命名映射：
 * - `order`：老订单接口家族（order/create、order/update 等），使用 snake_case `profit_price` / `stop_price`。
 * - `plan`：计划委托接口家族（plan_order/create、plan_order/update 等），使用 snake_case `profit_price` / `stop_price`。
 */
const FAMILY_FIELD_KEYS = {
  order: { profit: 'profit_price', stop: 'stop_price' },
  plan: { profit: 'profit_price', stop: 'stop_price' },
};

/**
 * 将 Tpsl_Form_State 映射为现货下单/计划委托接口的止盈止损入参。
 *
 * 用于 `/spot/private/v1/order/create`（限价/市价）与
 * `/spot/private/v1/plan_order/create`（计划委托）两接口家族共用，
 * 两家族入参统一为 snake_case（见 `FAMILY_FIELD_KEYS`）。
 *
 * 字段映射（简化版，仅触发价）：
 * - 止盈侧（止盈触发价 tpTriggerPrice）：>0 时订单成交后自动创建 TAKE_PROFIT 计划委托；
 *   入参命名为 `profit_price`。
 * - 止损侧（止损触发价 slTriggerPrice）：>0 时订单成交后自动创建 STOP_LOSS 计划委托；
 *   入参命名为 `stop_price`。
 *
 * 仅拼装触发价非空的一侧，值为原始输入不做任何数值转换/格式化；未勾选返回 {}。
 * 不产出价格类型 / 委托价 / 委托模式字段。纯函数，不修改入参。
 *
 * @param {Object} params
 * @param {boolean} params.checked - Inline_Tpsl 勾选框是否勾选
 * @param {Object} params.tpslOrder - 扁平的 Tpsl_Form_State
 * @param {'order'|'plan'} [params.family='plan'] - 目标接口家族，决定输出字段命名
 * @returns {Object} 依家族命名的止盈止损接口入参
 */
export function buildTpslApiParams({ checked, tpslOrder, family = 'plan' }) {
  if (!checked) return {};

  const out = {};
  const order = tpslOrder || {};
  const keys = FAMILY_FIELD_KEYS[family] || FAMILY_FIELD_KEYS.plan;

  const tpTriggerPrice = order[TP_SL_FORM_FIELDS.TP_TRIGGER];
  const slTriggerPrice = order[TP_SL_FORM_FIELDS.SL_TRIGGER];

  // 止盈侧：触发价非空时携带止盈价（原始输入值，不做数值转换/格式化）
  if (!isTriggerEmpty(tpTriggerPrice)) {
    out[keys.profit] = tpTriggerPrice;
  }

  // 止损侧：触发价非空时携带止损价（原始输入值，不做数值转换/格式化）
  if (!isTriggerEmpty(slTriggerPrice)) {
    out[keys.stop] = slTriggerPrice;
  }

  return out;
}
