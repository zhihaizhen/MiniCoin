import { toNumberZero } from '../../../utils/utils';

interface IFOWallet {
  coin: string;
  equity: number;
  walletBalance: number;
  totalPositionBalance: number;
  totalOrderBalance: number;
  afterCrossAb: number;
  totalCrossCoveredLoss: number;
  availableBalance: number;
  cumRealisedPnl: number;
  givenCash: number;
  serviceCash: number;
}

interface IFIWallet {
  coin: string;
  equityE8: string;
  walletBalanceE8: string;
  totalPositionBalanceE8: string;
  totalOrderBalanceE8: string;
  afterCrossAbE8: string;
  totalCrossCoveredLossE8: string;
  availableBalanceE8: string;
  cumRealisedPnlE8: string;
  givenCashE8: string;
  serviceCashE8: string;
}
const initState = {
  coin: '',
  equityE8: '',
  walletBalanceE8: '',
  totalPositionBalanceE8: '',
  totalOrderBalanceE8: '',
  afterCrossAbE8: '',
  totalCrossCoveredLossE8: '',
  availableBalanceE8: '',
  cumRealisedPnlE8: '',
  givenCashE8: '',
  serviceCashE8: ''
};

export const wallet = (data: IFIWallet = initState): IFOWallet => ({
  coin: data.coin,
  equity: toNumberZero(data.equityE8) / 1e8,
  walletBalance: toNumberZero(data.walletBalanceE8) / 1e8,
  totalPositionBalance: toNumberZero(data.totalPositionBalanceE8) / 1e8,
  totalOrderBalance: toNumberZero(data.totalOrderBalanceE8) / 1e8,
  afterCrossAb: toNumberZero(data.afterCrossAbE8) / 1e8,
  totalCrossCoveredLoss: toNumberZero(data.totalCrossCoveredLossE8) / 1e8,
  availableBalance: toNumberZero(data.availableBalanceE8) / 1e8,
  cumRealisedPnl: toNumberZero(data.cumRealisedPnlE8) / 1e8,
  givenCash: toNumberZero(data.givenCashE8) / 1e8,
  serviceCash: toNumberZero(data.serviceCashE8) / 1e8
});
