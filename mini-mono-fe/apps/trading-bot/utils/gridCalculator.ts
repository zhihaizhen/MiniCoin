/**
 * 网格交易计算工具函数
 */

interface GridParams {
  priceLower: number;
  priceUpper: number;
  gridCount: number;
  gridType: number; // 1=等差, 2=等比
}

/**
 * 计算网格间距
 * @param params 网格参数
 * @param precision 币对最小价格精度字符串，如 "0.01"、"0.00000001"，等差模式下用于格式化小数位数
 * @returns 格式化的网格间距字符串
 */
export const calculateGridStep = (params: GridParams, precision?: string | null): string => {
  const { priceLower, priceUpper, gridCount, gridType } = params;
  const lower = Number(priceLower);
  const upper = Number(priceUpper);
  const n = Number(gridCount);

  if (!lower || !upper || !n) {
    return '-';
  }

  if (gridType === 2) {
    // 等比：(upper / lower) ^ (1 / n) - 1
    const step = Math.pow(upper / lower, 1 / n) - 1;
    return `${(step * 100).toFixed(2)}%`;
  } else {
    // 等差：(upper - lower) / n
    const step = (upper - lower) / n;
    const decimals = precision?.includes('.') ? precision.split('.')[1].length : 2;
    return step.toFixed(decimals);
  }
};

/**
 * 计算单格收益率（返回数值，用于判断）
 * @param params 网格参数
 * @param feeRate 手续费率
 * @returns 收益率数值（等差返回最小值）
 */
export const calculateGridProfitRateNumber = (params: GridParams, feeRate: number): number | null => {
  const { priceLower, priceUpper, gridCount, gridType } = params;
  const lower = Number(priceLower);
  const upper = Number(priceUpper);
  const n = Number(gridCount);

  if (!lower || !upper || !n || !feeRate) {
    return null;
  }

  if (gridType === 2) {
    // 等比：网格间距 - 2*手续费
    const step = Math.pow(upper / lower, 1 / n) - 1;
    return step - 2 * feeRate;
  } else {
    // 等差：返回最小收益率（step / upper - 2*手续费）
    const step = (upper - lower) / n;
    return (step / upper) - 2 * feeRate;
  }
};

/**
 * 计算单格收益率
 * @param params 网格参数
 * @param feeRate 手续费率
 * @returns 格式化的单格收益率字符串
 */
export const calculateGridProfitRate = (params: GridParams, feeRate: number): string => {
  const { priceLower, priceUpper, gridCount, gridType } = params;
  const lower = Number(priceLower);
  const upper = Number(priceUpper);
  const n = Number(gridCount);

  if (!lower || !upper || !n || !feeRate) {
    return '-';
  }

  if (gridType === 2) {
    // 等比：网格间距 - 2*手续费
    const step = Math.pow(upper / lower, 1 / n) - 1;
    const profitRate = step - 2 * feeRate;
    return `${(profitRate * 100).toFixed(2)}%`;
  } else {
    // 等差：网格间距分别除以 upper 和 lower，得到一个区间，然后各减去 2*手续费
    const step = (upper - lower) / n;
    const profitRateUpper = (step / lower) - 2 * feeRate;
    const profitRateLower = (step / upper) - 2 * feeRate;
    return `${(profitRateLower * 100).toFixed(2)}% - ${(profitRateUpper * 100).toFixed(2)}%`;
  }
};
