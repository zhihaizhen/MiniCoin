import {
  TP_SL_MODE,
  TPSL_PRICE_LIMIT_PCT,
} from 'common/packages-biz/global-settings/usdt-settings';

/**
 * 止盈止损校验错误的 i18n key 标识（由上层翻译）。
 * 与 design「Error Handling / Testing Strategy」约定对齐。
 */
export const TPSL_ERROR_KEYS = {
  // 参考价（订单委托价）不可用（reference）
  refUnavailable: 'refUnavailableTip',
  // 触发价必须大于 0
  tpTriggerGtZero: 'tpTriggerGtZero',
  slTriggerGtZero: 'slTriggerGtZero',
  // 方向约束（相对订单委托价）
  tpTriggerGtRef: 'tpTriggerGtRef', // 买入：止盈触发价需大于订单委托价
  tpTriggerLtRef: 'tpTriggerLtRef', // 卖出：止盈触发价需小于订单委托价
  slTriggerLtRef: 'slTriggerLtRef', // 买入：止损触发价需小于订单委托价
  slTriggerGtRef: 'slTriggerGtRef', // 卖出：止损触发价需大于订单委托价
  // 限价委托模式委托价为空
  orderPriceRequired: 'orderPriceRequired',
  // 委托价超出 ±priceLimitPct 限制
  orderPriceOverLimit: 'orderPriceOverLimit',
};

/**
 * 判断一个数值字段是否为空（空字符串 / null / undefined / 非数字均视为空）。
 * @param {*} value
 * @returns {boolean}
 */
function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    Number.isNaN(Number(value))
  );
}

/**
 * 判断买卖方向是否为买入。设计约定 side 为 'BUY' | 'SELL'，此处大小写不敏感。
 * @param {string} side
 * @returns {boolean}
 */
function isBuySide(side) {
  return String(side).toUpperCase() === 'BUY';
}

/**
 * 校验单侧（止盈或止损）止盈止损参数，返回首个命中的错误 key（无错误返回 undefined）。
 * 校验顺序：触发价 > 0 → 方向约束 → 限价模式委托价非空 → 委托价 ±priceLimitPct 限制。
 *
 * @param {Object} args
 * @param {Object} args.entry - { triggerPrice?, orderPrice?, mode }
 * @param {boolean} args.isTP - true 为止盈侧，false 为止损侧
 * @param {boolean} args.isBuy - 是否买入方向
 * @param {number} args.ref - 订单委托价（Reference_Price）
 * @param {number} args.priceLimitPct - 委托价价格限制比例
 * @returns {string|undefined}
 */
function validateSide({ entry, isTP, isBuy, ref, priceLimitPct }) {
  const { triggerPrice, orderPrice, mode } = entry || {};

  // 触发价为空 → 该侧不参与校验
  if (isEmpty(triggerPrice)) return undefined;

  const trigger = Number(triggerPrice);

  // 3) 触发价必须大于 0（需求 5.1 / 5.2 / 4.12）
  if (trigger <= 0) {
    return isTP
      ? TPSL_ERROR_KEYS.tpTriggerGtZero
      : TPSL_ERROR_KEYS.slTriggerGtZero;
  }

  // 4) 方向约束（相对订单委托价，需求 5.3 ~ 5.6）
  if (isTP) {
    if (isBuy && trigger <= ref) return TPSL_ERROR_KEYS.tpTriggerGtRef; // 买入：止盈需 > ref
    if (!isBuy && trigger >= ref) return TPSL_ERROR_KEYS.tpTriggerLtRef; // 卖出：止盈需 < ref
  } else {
    if (isBuy && trigger >= ref) return TPSL_ERROR_KEYS.slTriggerLtRef; // 买入：止损需 < ref
    if (!isBuy && trigger <= ref) return TPSL_ERROR_KEYS.slTriggerGtRef; // 卖出：止损需 > ref
  }

  // 5) 6) 仅限价委托模式校验委托价（需求 5.7 / 5.8 / 5.9）
  if (mode === TP_SL_MODE.LIMIT) {
    // 5) 委托价不能为空
    if (isEmpty(orderPrice)) return TPSL_ERROR_KEYS.orderPriceRequired;

    const order = Number(orderPrice);
    // 6) 委托价 ±priceLimitPct 限制
    if (isBuy && order > trigger * (1 + priceLimitPct)) {
      return TPSL_ERROR_KEYS.orderPriceOverLimit; // 买入：委托价不得高于 触发价×(1+pct)
    }
    if (!isBuy && order < trigger * (1 - priceLimitPct)) {
      return TPSL_ERROR_KEYS.orderPriceOverLimit; // 卖出：委托价不得低于 触发价×(1-pct)
    }
  }

  return undefined;
}

/**
 * 止盈止损参数校验（纯函数，不修改输入）。
 *
 * 校验顺序（与 design「tpsl-validator」校验顺序表一致）：
 *   0) 未勾选 → { valid: true, errors: {} }
 *   1) 勾选且止盈/止损触发价均为空 → general（至少设置一项）
 *   2) 参考价（订单委托价）不可用 → reference
 *   3) 某侧触发价非空且 ≤ 0 → 对应 takeProfit / stopLoss（必须大于 0）
 *   4) 方向约束（相对参考价）→ 对应 takeProfit / stopLoss
 *   5) 限价委托模式且该侧委托价为空 → 对应 takeProfit / stopLoss（委托价不能为空）
 *   6) 限价委托模式委托价 ±priceLimitPct 限制 → 对应 takeProfit / stopLoss（超出限制）
 *   7) 全部通过 → { valid: true }
 *
 * @param {Object} params
 * @param {boolean} params.checked - 止盈止损勾选状态
 * @param {string} params.side - 买卖方向 'BUY' | 'SELL'
 * @param {number|undefined} params.referencePrice - 订单委托价（Reference_Price）
 * @param {Object} [params.tp] - 止盈侧 { triggerPrice?, orderPrice?, mode }
 * @param {Object} [params.sl] - 止损侧 { triggerPrice?, orderPrice?, mode }
 * @param {number} [params.priceLimitPct] - 委托价价格限制比例，默认 TPSL_PRICE_LIMIT_PCT
 * @returns {{ valid: boolean, errors: { takeProfit?: string, stopLoss?: string, reference?: string, general?: string } }}
 */
export function validateTpsl({
  checked,
  side,
  referencePrice,
  tp,
  sl,
  priceLimitPct = TPSL_PRICE_LIMIT_PCT,
}) {
  // 0) 未勾选 → 直通，不校验、不带参（需求 6.2）
  if (!checked) {
    return { valid: true, errors: {} };
  }

  const tpEntry = tp || {};
  const slEntry = sl || {};
  const tpTriggerEmpty = isEmpty(tpEntry.triggerPrice);
  const slTriggerEmpty = isEmpty(slEntry.triggerPrice);

  // 止盈与止损触发价同时为空 → 视为未设置止盈止损，直接通过、不带参、不报错
  // （勾选框仅控制输入框显隐，不做业务校验；勾选但未输入按未设置处理）
  if (tpTriggerEmpty && slTriggerEmpty) {
    return { valid: true, errors: {} };
  }

  // 2) 参考价（订单委托价）不可用 → reference（需求 5.11）
  if (isEmpty(referencePrice)) {
    return {
      valid: false,
      errors: { reference: TPSL_ERROR_KEYS.refUnavailable },
    };
  }

  const isBuy = isBuySide(side);
  const ref = Number(referencePrice);

  // 3) ~ 6) 逐侧校验（每侧取首个命中的错误）
  const errors = {};
  const tpError = validateSide({
    entry: tpEntry,
    isTP: true,
    isBuy,
    ref,
    priceLimitPct,
  });
  const slError = validateSide({
    entry: slEntry,
    isTP: false,
    isBuy,
    ref,
    priceLimitPct,
  });

  if (tpError) errors.takeProfit = tpError;
  if (slError) errors.stopLoss = slError;

  // 7) 全部通过（需求 5.12）
  return { valid: Object.keys(errors).length === 0, errors };
}
