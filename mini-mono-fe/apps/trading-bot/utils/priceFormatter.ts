/**
 * 价格格式化工具函数
 */

/**
 * 限制小数点位数不超过指定位数
 * @param value 输入值
 * @param maxDecimals 最大小数位数，默认 8 位
 * @returns 格式化后的字符串
 */
export const limitDecimalPlaces = (value: string, maxDecimals = 8): string => {
  if (!value) return value;

  const regex = /^\d*\.?\d*$/;
  if (!regex.test(value)) {
    return value.slice(0, -1);
  }

  const parts = value.split('.');
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    return `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
  }

  return value;
};

/**
 * 根据 minPricePrecision 格式化价格（向下取整）
 * @param value 输入价格字符串
 * @param precision 精度字符串，如 "0.01"
 * @returns 格式化后的价格字符串
 * 
 * @example
 * formatPriceByPrecision("5.5555", "0.01") // "5.55"
 * formatPriceByPrecision("0.001", "0.01")  // "0.00"
 */
export const formatPriceByPrecision = (value: string, precision: string | null): string => {
  if (!value || !precision) return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  const precisionNum = parseFloat(precision);
  if (isNaN(precisionNum) || precisionNum <= 0) return value;

  // 计算精度对应的小数位数
  const decimalPlaces = precision.includes('.') 
    ? precision.split('.')[1].length 
    : 0;

  // 向下取整到指定精度的倍数
  const factor = Math.pow(10, decimalPlaces);
  const truncated = Math.floor(num * factor) / factor;

  return truncated.toFixed(decimalPlaces);
};

/**
 * 从精度字符串中提取小数位数
 * @param precision 精度字符串，如 "0.001"
 * @returns 小数位数，如 3；无效时返回 null
 */
export const getPrecisionDecimals = (precision: string | null): number | null => {
  if (!precision) return null;
  if (!precision.includes('.')) return 0;
  return precision.split('.')[1].length;
};

/**
 * 从 quoteTokens 配置中获取指定币对的 minPricePrecision
 * @param selectedPair 币对字符串，如 "ETH/USDT"
 * @param quoteTokens quoteTokens 配置数组
 * @returns minPricePrecision 字符串或 null
 */
export const getMinPricePrecision = (
  selectedPair: string,
  quoteTokens: any[]
): string | null => {
  if (!selectedPair || !quoteTokens || quoteTokens.length === 0) return null;

  const [baseToken, quoteTokenName] = selectedPair.split('/');
  const quoteTokenConfig = quoteTokens.find((item: any) => item.tokenId === quoteTokenName);
  if (!quoteTokenConfig?.quoteTokenSymbols) return null;

  const symbolConfig = quoteTokenConfig.quoteTokenSymbols.find(
    (symbol: any) => symbol.baseTokenName === baseToken
  );

  return symbolConfig?.minPricePrecision || null;
};
