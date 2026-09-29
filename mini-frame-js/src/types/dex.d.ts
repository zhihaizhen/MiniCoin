/**  */
export interface WalletCoin {
  blockConfirmNumber: number
  coin: string
  coinChain: string
  coinChainName: string
  coinFullName: string
  hasTag: string
  iconNightUrl: string
  iconUrl: string
  minAmount: string
  minAmountE8: string
  notifyHint: string
  precisionE0: number
  tag: string
  transferStatus: number
}

export interface DepositAddress {
  address: string
  canDeposit: boolean
  chain: string
  minConfirmations: string
  minDepositAmount: string
  minDepositAmountE8: string
  needConfirm: boolean
  qrcode: string
  tag: string
  type: string
  userId: string
}

export interface ChainType {
  auditThresholdE8: number
  chain: string
  chainName: string
  code: number
  feeE8: number
  status: number
  tag: number
  url: string
  withdrawMaxE8: number
  withdrawMinE8: number
}

export interface WithdrawAddress {
  address: string
  chainType: string
  coin: string
  destination_tag: string
  id: number
  remark: string
}

export interface Asset {
  afterCrossAbE8: string
  availableBalanceE8: string
  coin: string
  cumRealisedPnlE8: string
  equityE8: string
  givenCashE8: string
  serviceCashE8: string
  totalCrossCoveredLossE8: string
  totalOrderBalanceE8: string
  totalPositionBalanceE8: string
  totalUnrealisedPnlByBpE8: string
  totalUnrealisedPnlByLpE8: string
  totalUnrealisedPnlByMpE8: string
  totalUnrealisedPnlE8: string
  updatedAtE3: string
  userId: string
  walletBalanceE8: string
  walletVersion: string
}

export interface Currency {
  code: string
  isVisible: 0 | 1
  nameEn: string
  'nameZh-CN': string
  'nameZh-HK': string
}
