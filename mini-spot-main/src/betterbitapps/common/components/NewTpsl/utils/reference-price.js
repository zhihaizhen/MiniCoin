import { ORDER_TYPE } from 'common/packages-biz/global-settings/usdt-settings';

/**
 * 推导止盈止损方向约束与委托价限制校验所用的「订单委托价」（Reference_Price）。
 *
 * - 限价委托（LIMIT）→ 订单委托价 commissionPrice（需求 2.4）
 * - 计划委托（CONDITION）-限价委托 → 订单委托价 commissionPrice（需求 2.4）
 * - 市价委托（MARKET）→ 最新成交价 lastPriceNumber（需求 2.5）
 * - 计划委托（CONDITION）-市价委托 → 触发价 triggerPrice（OQ-1）
 *
 * 纯函数，便于属性测试。
 *
 * @param {Object} params
 * @param {string} params.orderType - 下单类型（ORDER_TYPE 之一）
 * @param {number|undefined} params.commissionPrice - 订单委托价
 * @param {number|undefined} params.lastPriceNumber - 最新成交价
 * @param {string} [params.conditionType] - 计划委托下的委托方式（ORDER_TYPE.LIMIT / ORDER_TYPE.MARKET）
 * @param {number|undefined} [params.triggerPrice] - 计划委托触发价
 * @returns {number|undefined} 订单委托价（Reference_Price），无法推导时返回 undefined
 */
export function getReferencePrice({
  orderType,
  commissionPrice,
  lastPriceNumber,
  conditionType,
  triggerPrice,
}) {
  if (orderType === ORDER_TYPE.MARKET) return lastPriceNumber; // 需求 2.5（市价：最新成交价）
  if (orderType === ORDER_TYPE.LIMIT) return commissionPrice; // 需求 2.4（限价：订单委托价）
  if (orderType === ORDER_TYPE.CONDITION) {
    // 计划委托：限价委托取委托价，市价委托取触发价（OQ-1）
    return conditionType === ORDER_TYPE.LIMIT ? commissionPrice : triggerPrice;
  }
  return undefined;
}
