import { getDynamicSymbol } from '../api';
import { toNumberZero } from './index';


// 专门处理合约的dynamnic接口
const accMul = (arg1: number | string, arg2: number | string): number => {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  try {
    m += s1.split('.')[1].length;
  } catch (e) {
    // console.log('acc8Mul-s1', e);
  }

  try {
    m += s2.split('.')[1].length;
  } catch (e) {
    // console.log('acc8Mul-s2', e);
  }
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / 10 ** m;
};

interface DepthItem {
  label: number;
  ratio: number;
  value: number;
  meta: Record<string, any>;
}

const getDepthsByTick = ({ ratios = '1,2,4,10', tickSize, priceScale }: { ratios?: string; tickSize: number; priceScale: number }): DepthItem[] => {
  if (!Number(tickSize) || !ratios || !ratios.split) return [];
  return ratios.split(',').map((ratio) => {
    const value = accMul(Number(tickSize), Number(ratio));
    let meta: Record<string, any> = { priceScale };
    if (Number(ratio) === 1) {
      meta = {
        ...meta,
        isDefault: true,
      };
    }
    return {
      label: value,
      ratio: Number(ratio),
      value,
      meta,
    };
  });
};

interface PriceInputLabel {
  label: string;
  value: number;
}

const getPriceInputLabelsByTick = (tickSize: number): PriceInputLabel[] => {
  const PRICE_INPUT_LABELS_LEVEL = [10, 50, 200];
  let labels: PriceInputLabel[] = [];
  if (!Number(tickSize)) return labels;
  PRICE_INPUT_LABELS_LEVEL.forEach((ratio) => {
    const value = accMul(Number(tickSize), Number(ratio));
    labels = [
      ...labels,
      {
        label: `+${value}`,
        value,
      },
      {
        label: `-${value}`,
        value: -value,
      },
    ];
  });
  return labels;
};

interface SymbolRawData {
  symbolName: string;
  symbolAlias: string;
  baseCurrency: string;
  quoteCurrency: string;
  contractType: string;
  maxPrice: number;
  minPrice: number;
  minQty: number;
  maxNewOrderQty: number;
  walletCoinOrderFraction: number;
  walletBalanceFraction: number;
  upnlFraction: number;
  priceScale: number;
  tickSize: number;
  tickSizeFraction: number;
  lotFraction: number;
  lotSize: number;
  priceFraction: number;
  obDepthMergeTimes: string;
  indexSort: number;
  baseInitialMarginRateE4: number;
  stepInitialMarginRateE4: number;
  baseMaintenanceMarginRateE4: number;
  stepMaintenanceMarginRateE4: number;
  baseMaxOrdPzValue: number;
  stepMaxOrdPzValue: number;
  section: string;
  quarter: string;
  symbolTags: string[];
  startTradingTimeE3: number;
  settleTimeE3: number;
  spMaxValueE8: number;
  isPopular: boolean;
  handingFeeProfitLossFraction: number;
  defaultTakerFeeRateE8: number;
  priceLimitPntE6: number;
  [key: string]: any;
}

const symbolModel = ({
  symbolName,
  symbolAlias,
  baseCurrency,
  quoteCurrency,

  contractType,
  maxPrice,
  minPrice,
  minQty,
  maxNewOrderQty,
  walletCoinOrderFraction,
  walletBalanceFraction,
  upnlFraction,
  priceScale,
  tickSize,
  tickSizeFraction,
  lotFraction,
  lotSize,
  priceFraction,
  obDepthMergeTimes,
  indexSort,
  baseInitialMarginRateE4,
  stepInitialMarginRateE4,
  baseMaintenanceMarginRateE4,
  stepMaintenanceMarginRateE4,
  baseMaxOrdPzValue,
  stepMaxOrdPzValue,
  section,
  quarter,
  symbolTags,
  startTradingTimeE3,
  settleTimeE3,
  spMaxValueE8,
  isPopular,
  handingFeeProfitLossFraction,
  defaultTakerFeeRateE8,
  priceLimitPntE6,
  ...others
}: SymbolRawData) => {

  const isInverse = false;
  return {
    ...others,
    symbol: symbolName,
    symbolName,
    symbolAlias,
    coin: baseCurrency,
    contractCoin: isInverse ? quoteCurrency : baseCurrency,
    walletCoin: isInverse ? baseCurrency : quoteCurrency,
    baseCoin: quoteCurrency,

    contractType,
    maxPrice: toNumberZero(maxPrice),
    minPrice: toNumberZero(minPrice),
    maxQty: toNumberZero(maxNewOrderQty),
    maxNewOrderQty,
    minQty: toNumberZero(minQty),
    walletCoinOrderFraction,
    balanceFraction: toNumberZero(walletBalanceFraction),
    baseCoinFraction: isInverse ? lotFraction : walletCoinOrderFraction,
    upnlFraction: toNumberZero(upnlFraction),
    priceScale,
    tickSize: toNumberZero(tickSize),
    tickSizeFraction,
    priceStep: tickSize * Number(`1e${tickSizeFraction || 0}`),
    priceFraction,
    lotStep: lotSize * Number(`1e${lotFraction || 0}`),
    lotSize: toNumberZero(lotSize),
    lotFraction,
    obDepthMergeTimes,
    indexSort,
    initMargin: toNumberZero(baseInitialMarginRateE4) / 100,
    maintainMargin: toNumberZero(baseMaintenanceMarginRateE4) / 100,
    imIncrements: toNumberZero(stepInitialMarginRateE4) / 100,
    mmIncrements: toNumberZero(stepMaintenanceMarginRateE4) / 100,
    rLBases: toNumberZero(baseMaxOrdPzValue),
    rLIncrements: toNumberZero(stepMaxOrdPzValue),
    section,
    symbolDepths: getDepthsByTick({
      ratios: obDepthMergeTimes,
      tickSize,
      priceScale,
    }),
    priceInputLabels: getPriceInputLabelsByTick(tickSize),
    quarter,
    symbolTags,
    startTradingTime: toNumberZero(startTradingTimeE3),
    settleTime: toNumberZero(settleTimeE3),
    isPopular,
    spMaxValue: spMaxValueE8 / 1e8,
    defaultTakerFeeRate: defaultTakerFeeRateE8 / 1e8,
    priceLimitPnt: priceLimitPntE6 / 1e6,
    handingFeeProfitLossFraction: handingFeeProfitLossFraction || 8,
  };
};

type SymbolModel = ReturnType<typeof symbolModel>;
// dynamic接口返回数据类型
interface SymbolListData {
  LinearPerpetual?: SymbolRawData[];
  InversePerpetual?: SymbolRawData[];
  StockRwaPerpetual?: SymbolRawData[];
  MetalRwaPerpetual?: SymbolRawData[];
  OfflineSymbols?: {
    LinearPerpetual?: SymbolRawData[];
    InversePerpetual?: SymbolRawData[];
    BlockTradePerpetual?: SymbolRawData[];
  };
  BlockTradePerpetual?: SymbolRawData[];
}

interface AllSymbolList {
  LinearPerpetual: SymbolModel[];
  InversePerpetual: SymbolModel[];
  BlockTradePerpetual: SymbolModel[];
}

const getAllSymbolList = ({ LinearPerpetual = [], InversePerpetual = [], StockRwaPerpetual = [], MetalRwaPerpetual = [], BlockTradePerpetual = [] }: SymbolListData = {}): AllSymbolList => {
  const symbolMap = new Map<string, SymbolRawData>();
  const allSymbols = [...LinearPerpetual, ...StockRwaPerpetual, ...MetalRwaPerpetual];

  allSymbols.forEach(symbol => {
    if (!symbolMap.has(symbol.symbolName)) {
      symbolMap.set(symbol.symbolName, symbol);
    }
  });

  const allUsdtSymbolList = Array.from(symbolMap.values());
  return {
    LinearPerpetual: allUsdtSymbolList.map((symbol) => symbolModel(symbol)), // 包括rwa，正向永续
    InversePerpetual: InversePerpetual.map((symbol) => symbolModel(symbol)),
    BlockTradePerpetual: BlockTradePerpetual.map((symbol) => symbolModel(symbol)),
  };
};


const getAllSymbolListIncludeOffline = (data: SymbolListData): AllSymbolList => {
  const { OfflineSymbols = {} } = data || {};
  const { LinearPerpetual, InversePerpetual, BlockTradePerpetual } = getAllSymbolList(data);

  const linear = OfflineSymbols?.LinearPerpetual || [];
  const inverse = OfflineSymbols?.InversePerpetual || [];
  const block = OfflineSymbols?.BlockTradePerpetual || [];

  const blockOffline = block.map((symbol) => symbolModel(symbol));
  const linearOffline = linear.map((symbol) => symbolModel(symbol));
  const inverseOffline = inverse.map((symbol) => symbolModel(symbol));

  const allLinearSymbolList = LinearPerpetual.concat(linearOffline);
  const allInverseSymbolList = InversePerpetual.concat(inverseOffline);
  const allBlockSymbolList = BlockTradePerpetual.concat(blockOffline);
  return {
    LinearPerpetual: allLinearSymbolList,
    InversePerpetual: allInverseSymbolList,
    BlockTradePerpetual: allBlockSymbolList,
  };
};

const getAllSymbolConfig = (obj: AllSymbolList): Record<string, SymbolModel> => {
  const list = Object.values(obj).reduce<SymbolModel[]>((arr, item) => {
    return [...arr, ...item];
  }, []);

  const symbols: Record<string, SymbolModel> = {};
  list.forEach((it) => {
    symbols[it.symbolName] = it;
  });

  return symbols;
};

const handleDynamicData = (data: SymbolListData = {}) => {
  const allSymbolList = getAllSymbolList(data);
  const allSymbolConfig = getAllSymbolConfig(allSymbolList);

  const allSymbolListIncludeOffline = getAllSymbolListIncludeOffline(data);
  const allSymbolConfigIncludeOffline = getAllSymbolConfig(allSymbolListIncludeOffline);

  const dynamicSymbolData = {
    allSymbolList,
    allSymbolConfig,
    allSymbolListIncludeOffline,
    allSymbolConfigIncludeOffline,
  };

  return dynamicSymbolData;
};


export {
  getDynamicSymbol,
  getAllSymbolList,
  getAllSymbolListIncludeOffline,
  getAllSymbolConfig,
  handleDynamicData,
};
