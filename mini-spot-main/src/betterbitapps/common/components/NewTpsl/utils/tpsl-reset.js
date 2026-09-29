import {
  TP_SL_FORM_INIT,
  TP_SL_FORM_FIELDS,
} from 'common/packages-biz/global-settings/usdt-settings';

/**
 * 止盈止损表单状态（Tpsl_Form_State）的重置触发项。
 *
 * - success：订单提交成功（需求 7.1）
 * - symbol ：切换当前交易对（需求 7.5）
 * - side   ：切换买卖方向（需求 7.5）
 * - type   ：切换下单类型（需求 7.5）
 * - uncheck：取消勾选 Inline_Tpsl 勾选框（需求 7.4）
 *
 * @typedef {'success' | 'uncheck' | 'symbol' | 'side' | 'type'} TpslResetTrigger
 */

/**
 * 触发「完整重置为 TP_SL_FORM_INIT」的触发项集合。
 * 下单成功、切换交易对 / 买卖方向 / 下单类型均执行完整重置。
 */
const FULL_RESET_TRIGGERS = ['success', 'symbol', 'side', 'type'];

/**
 * 依据触发项派生新的止盈止损表单状态（纯函数，不可变更新，不修改入参）。
 *
 * 行为（需求 7.1 / 7.4 / 7.5，对应 Correctness Property 11）：
 * - trigger 为 'success' / 'symbol' / 'side' / 'type' → 完整重置：
 *   返回 TP_SL_FORM_INIT 的一份拷贝（清空止盈/止损触发价与委托价、
 *   委托模式恢复为初始值 LIMIT、触发价格类型固定为最新成交价 LastPrice）。
 * - trigger 为 'uncheck'（取消勾选）→ 仅清空止盈/止损触发价与委托价为空
 *   （tpTriggerPrice / tpOrderPrice / slTriggerPrice / slOrderPrice 置空），
 *   委托模式（tpMode / slMode）与固定触发价格类型（tpTriggerBy / slTriggerBy）
 *   保持不变（需求 7.4）。
 * - 其它未知触发项：保守返回原状态的浅拷贝，不做修改。
 *
 * 注：tpslChecked / tpslExpanded 双状态由面板（任务 10.4）维护，本函数仅产出
 * 表单状态（Tpsl_Form_State）的派生结果。
 *
 * @template {Record<string, any>} S
 * @param {S} state - 当前止盈止损表单状态（扁平字段对象，结构同 TP_SL_FORM_INIT）
 * @param {TpslResetTrigger} trigger - 重置触发项
 * @returns {S} 重置后的新状态对象（不可变更新）
 */
export function resetTpslByTrigger(state, trigger) {
  // 完整重置：返回 TP_SL_FORM_INIT 的拷贝，避免调用方误改共享常量
  if (FULL_RESET_TRIGGERS.includes(trigger)) {
    return { ...TP_SL_FORM_INIT };
  }

  // 取消勾选：仅清空触发价与委托价，保留委托模式与固定 triggerBy（需求 7.4）
  if (trigger === 'uncheck') {
    return {
      ...state,
      [TP_SL_FORM_FIELDS.TP_TRIGGER]: undefined,
      [TP_SL_FORM_FIELDS.TP_ORDER]: undefined,
      [TP_SL_FORM_FIELDS.SL_TRIGGER]: undefined,
      [TP_SL_FORM_FIELDS.SL_ORDER]: undefined,
    };
  }

  // 未知触发项：不修改，返回浅拷贝以保持不可变语义
  return { ...state };
}
