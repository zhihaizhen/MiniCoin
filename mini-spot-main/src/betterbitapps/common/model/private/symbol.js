import BigNumber from 'bignumber.js';
import { handleX } from 'common/utils/order';
import { toNumberZero, getDecimalPlaces } from 'common/utils/utils';

/**
 * 将 tickSize 映射为 WS 需要的 dumpScale
 * - tickSize < 1：dumpScale = 小数位数（0.01 有 2 位）
 * - tickSize >= 1：dumpScale = -整数位数（10 有 2 位 => -2）
 */
export const getDumpScaleByTickSize = (tickSize) => {
  if (!tickSize) return undefined;
  const bn = new BigNumber(String(tickSize).trim());
  if (!bn.isFinite() || bn.lte(0)) return undefined;

  const s = bn.toString(10);
  const hasExp = /e/i.test(s);

  if (bn.gte(1)) {
    if (hasExp) return -(bn.e + 1);
    const intPart = s.split('.')[0].replace(/^0+/, '') || '0';
    return -intPart.length;
  }

  if (hasExp) return -bn.e;
  const frac = (s.split('.')[1] || '').replace(/0+$/, '');
  return frac.length;
};

export const symbol = (data = {}) => {
  const {
    baseTokenName, // BTC
    quoteTokenName, // USDT
    basePrecision, //
    quotePrecision,
    minTradeQuantity,
    maxTradeQuantity,
    minTradeAmount,
    maxTradeAmount,
    minPricePrecision,
    digitMerge = '', // "100,10,1,0.1,0.01",
    takerBuyFee,
    takerSellFee,
    riskTags = [], // 风险提示标签
    sectionIds, // 板块分类
  } = data;
  const digitMergeArr = String(digitMerge)
    .split(',')
    .map((x) => String(x).trim())
    .filter(Boolean)
    .reverse(); // [0.01,0.1,1,10,100]

  // 深度档位
  const symbolDepths = digitMergeArr.map((item, index) => {
    const value = String(item).trim();
    const dumpScale = getDumpScaleByTickSize(value);
    const id = dumpScale > 0 ? dumpScale : 1 - Math.abs(dumpScale);
    return {
      label: value,
      value,
      // dumpScale为ws 参数：0.01=>2, 0.1=>1, 1=>-1, 10=>-2, 100=>-3
      // id为ws 参数：0.01=>2, 0.1=>1, 1=>0, 10=>-1, 100=>-2
      meta: { id, dumpScale, value, isDefault: index === 0 },
    };
  });

  const priceFraction = getDecimalPlaces(minPricePrecision);
  const tickSizeFraction = priceFraction;
  const priceStep = new BigNumber(minPricePrecision)
    .times(new BigNumber(10).pow(priceFraction))
    .toNumber();

  return {
    symbol: baseTokenName,
    symbolAlias: `${baseTokenName}${quoteTokenName}`,
    symbolFullName: `${baseTokenName}/${quoteTokenName}`,
    spotCoin: baseTokenName,
    walletCoin: quoteTokenName,
    coin: baseTokenName,

    balanceFraction: getDecimalPlaces(quotePrecision), // 资产精度
    walletCoinOrderFraction: getDecimalPlaces(quotePrecision), // 资产下单的精度

    lotStep: getDecimalPlaces(basePrecision), // 数量 如2
    lotFraction: getDecimalPlaces(basePrecision), // 当前币种的小数位 如2,
    lotSize: basePrecision, // 当前币种的最小值 如 0.01

    priceStep, // 价格 tick, 如 1 或者 5
    priceFraction, // 显示价格精度 如4,
    priceScale: 1 * `1e${tickSizeFraction || 0}`, // 价格放大倍数

    tickSize: minPricePrecision, // 价格tick, 如 0.001
    tickSizeFraction, // 输入价格精度

    maxPrice: 999999, // 最大下单价格
    minPrice: '', //  最小下单价格
    maxQty: maxTradeQuantity, // 最大订单数量,币种为单位，
    minQty: minTradeQuantity, // 最小订单数量,币种为单位，如0.01，废弃

    minTradeAmount, // 最小订单金额,usdt为单位， 以金额为准
    maxTradeAmount, // 最大订单金额,usdt为单位，

    symbolDepths, // ob 深度档位：对象数组（label/value/rmeta）
    takerBuyFee,
    takerSellFee,
    riskTags,
    sectionIds

  };
};
