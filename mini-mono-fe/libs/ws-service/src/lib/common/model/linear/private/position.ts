import { COINS } from '../../../packages-biz/by-global-settings';
import { toNumberZero } from '../../../utils/utils';

export const position = (data = {}) => {
  const {
    adlRankIndicator,
    symbol,
    isAutoAddMargin,
    isIsolated,
    mode,
    positionStatus,
    side,
    slTriggerBy,
    tpSlMode,
    tpTriggerBy
  } = data;
  return {
    activationPrice: toNumberZero(data.activationPrice),
    adlRankIndicator,
    bustPrice: toNumberZero(data.bustPrice),
    bv2c: toNumberZero(data.bv2cE8) / 1e8, // buyValueToCost
    closingOrderId: toNumberZero(data.closingOrderId),
    closingPrice: toNumberZero(data.closingPrice),
    closingQty: toNumberZero(data.closingQtyX) / 1e8,
    baseCoin: COINS.USDT,
    cumRealisedPnl: toNumberZero(data.cumRealisedPnlE8) / 1e8,
    curTermRealisedPnl: toNumberZero(data.curTermRealisedPnlE8) / 1e8,
    entryPrice: toNumberZero(data.entryPriceE8) / 1e8,
    extraAddedMargin: toNumberZero(data.extraAddedMarginE8) / 1e8,
    fc: toNumberZero(data.fcE8) / 1e8,
    fq: toNumberZero(data.fqX) / 1e8, // freeQty
    isAutoAddMargin,
    isIsolated,
    leverage: toNumberZero(data.leverageE2) / 1e2,
    liqPrice: toNumberZero(data.liqPrice),
    markPrice: toNumberZero(data.markPrice),
    minPositionCost: toNumberZero(data.minPositionCostE8) / 1e8,
    mode,
    occClosingFee: toNumberZero(data.occClosingFeeE8) / 1e8,
    occFundingFee: toNumberZero(data.occFundingFeeE8) / 1e8,
    orderBalance: toNumberZero(data.orderBalanceE8) / 1e8,
    positionBalance: toNumberZero(data.positionBalanceE8) / 1e8,
    positionIdx: toNumberZero(data.positionIdx),
    positionMargin: toNumberZero(data.positionMarginE8) / 1e8,
    positionStatus,
    riskId: toNumberZero(data.riskId),
    side,
    size: toNumberZero(data.sizeX) / 1e8,
    slFreeSize: toNumberZero(data.slFreeSizeX) / 1e8,
    slOrderNum: toNumberZero(data.slOrderNum),
    slTriggerBy,
    stopLoss: toNumberZero(data.stopLoss),
    sv2c: toNumberZero(data.sv2cE8) / 1e8, // sellValueToCost
    symbol,
    takeProfit: toNumberZero(data.takeProfit),
    todayRealisedPnl: toNumberZero(data.todayRealisedPnlE8) / 1e8,
    tpFreeSize: toNumberZero(data.tpFreeSizeX) / 1e8,
    tpOrderNum: toNumberZero(data.tpOrderNum),
    tpSlMode,
    tpTriggerBy,
    trailingStop: toNumberZero(data.trailingStop),
    // unRealisedPnlByBp: toNumberZero(data.unrealisedPnlByBpE8 / 1e8),
    unRealisedPnlByLp: toNumberZero(data.unrealisedPnlByLpE8) / 1e8,
    unRealisedPnlByMp: toNumberZero(data.unrealisedPnlByMpE8) / 1e8,
    unrealisedPnl: toNumberZero(data.unrealisedPnlE8) / 1e8,
    value: toNumberZero(data.valueE8) / 1e8 // positionValue
  };
};
