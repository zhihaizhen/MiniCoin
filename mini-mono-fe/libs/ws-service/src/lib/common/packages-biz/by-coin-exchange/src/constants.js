export const COINS = ['BTC', 'ETH', 'EOS', 'XRP', 'USDT'];
export const COIN_QTY_PRECISION = {
  btc: 8,
  eth: 8,
  eos: 4,
  xrp: 2,
  usdt: 4,
};

export const QTY_PERCENTAGE_SELECTIONS = [
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
];

/**
 * init: 兑换受理
 * Pending: 兑换中
 * asset_transfer: 资产划转中
 * finance_transfer: 财务划转中
 * Success: 兑换成功
 * Failure: 兑换失败
 */
export const EXCHANGE_STATUS = {
  INIT: 'init',
  PENDING: 'Pending',
  ASSET_TRANSFER: 'asset_transfer',
  FINANCE_TRANSFER: 'finance_transfer',
  SUCCESS: 'Success',
  FAILURE: 'Failure',
};
