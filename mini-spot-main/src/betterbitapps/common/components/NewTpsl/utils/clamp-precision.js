import BigNumber from 'bignumber.js';

/**
 * 将数值的小数位限制到报价精度（tickSizeFraction）。
 *
 * 语义说明（与现货价格输入精度处理一致）：
 * - 截断（向下取整 ROUND_DOWN），而非四舍五入；不补零，仅限制小数位数。
 * - 仅做精度限制，不做范围（min/max）校验。
 * - 空值 / 非数字输入：原样返回（保持 undefined / 空串 / 原始非法输入不变），
 *   交由上层做有效性校验与提示。
 *
 * 注：@unified/helpers 的 `intercept` 同样基于 BigNumber 截断，但它会把非数字
 * 输入强制视为 0 并补齐尾随零（返回定长字符串），不适用于「输入即时精度限制」
 * 且与本函数对空/非数字输入的边界语义冲突，故此处直接使用 BigNumber 实现。
 *
 * @param {number|string|null|undefined} value 待限制的数值（可能来自输入框）
 * @param {number} tickSizeFraction 报价精度（允许的最大小数位数）
 * @returns {number|string|null|undefined} 截断到指定精度后的值；空/非数字输入原样返回
 */
export function clampPrecision(value, tickSizeFraction) {
  // 空值原样返回（不做精度限制）
  if (value === undefined || value === null || value === '') {
    return value;
  }

  const bn = new BigNumber(value);

  // 非数字输入原样返回，由上层负责有效性校验
  if (bn.isNaN() || !bn.isFinite()) {
    return value;
  }

  // 归一化精度：非法精度按 0 位处理
  const decimals =
    Number.isInteger(tickSizeFraction) && tickSizeFraction >= 0
      ? tickSizeFraction
      : 0;

  // 截断到指定小数位（ROUND_DOWN），不补零
  const clamped = bn.decimalPlaces(decimals, BigNumber.ROUND_DOWN);

  // 保持输入类型：字符串入 → 字符串出，数字入 → 数字出
  return typeof value === 'string' ? clamped.toString() : clamped.toNumber();
}

export default clampPrecision;
