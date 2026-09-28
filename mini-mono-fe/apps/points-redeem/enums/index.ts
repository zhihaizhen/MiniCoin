/** 活动状态 */
export enum CampaignStatus {
  NotStarted = '0', // 未开始
  Ongoing = '1', // 进行中
  Ended = '2' // 已结束
}

/** 报名状态 */
export enum RegisterStatus {
  NotRegistered = '0', // 未报名
  Registered = '1' // 已报名
}
/** 任务事件类型 */
export enum TaskEvent {
  Trade = 'token_user_trade', // 交易
  Deposit = 'token_user_deposit', // 入金
  TradeFee = 'token_user_trade_fee' // 手续费
}
/** 产品类型 */
export enum ProductType {
  Future = 'Future', // 合约
  Asset = 'Asset' // 资产
}
/** 任务发放状态 */
export enum TaskStatus {
  Awarding = 'Awarding', // 发放中
  Processing = 'Processing',
  Finished = 'Finished'
}
/** 任务审核状态 */
export enum TaskAuditStatus {
  Audit = 'audit',
  Pass = 'pass',
  Reject = 'reject'
}
/** 是否展示 */
export enum VisibleStatus {
  Yes = 'Y',
  No = 'N'
}

/** 奖励类型枚举 */
export enum AwardType {
  /** 抵扣金 */
  ServiceCash = 'ServiceCash',
  /** 后体验金 */
  PostGivenCash = 'PostGivenCash',
  /** 先体验金 */
  PreGivenCash = 'PreGivenCash',
  /** 真金 */
  RealCash = 'RealCash',
  /** 实物 */
  PhysicalAward = 'PhysicalAward',

  MacBookPro36Gb1Tb = 'MacBookPro36Gb1Tb',
  IPhone17ProMax1Tb = 'IPhone17ProMax1Tb',
  IPhone17ProMax2Tb = 'IPhone17ProMax2Tb',
  IPhone17Pro1Tb = 'IPhone17Pro1Tb',
  IPhone17512Gb = 'IPhone17512Gb',
  IPadAir13Inch = 'IPadAir13Inch',
  AppleWatchSeries11 = 'AppleWatchSeries11',
  RedeemKnapsack = 'RedeemKnapsack',
  RedeemItems = 'RedeemItems',
  RedeemSuitcase = 'RedeemSuitcase',

  GoldJewelry2g = 'GoldJewelry2g',
  GoldJewelry3g = 'GoldJewelry3g',
  GoldJewelry5g = 'GoldJewelry5g',
  GoldJewelry10g = 'GoldJewelry10g',
  GoldJewelry20g = 'GoldJewelry20g',
  GoldJewelry30g = 'GoldJewelry30g',

  WCCap = 'WCCap',
  WCTee = 'WCTee',
  WCR7Ball = 'WCR7Ball',
  WCPMFigure = 'WCPMFigure',
  WCSpeaker = 'WCSpeaker',
  WCGinBox = 'WCGinBox',
  WCGoldenBallBox = 'WCGoldenBallBox',
  WCSignedJersey = 'WCSignedJersey',
  WCSemiTrip2P = 'WCSemiTrip2P',
  WCFinalTrip2P = 'WCFinalTrip2P',

  HWWatchGT6Pro = 'HWWatchGT6Pro',
  AppleWatchUltra2 = 'AppleWatchUltra2',
  CartierBB42 = 'CartierBB42',
  RolexSubDate = 'RolexSubDate',
  RolexDaytonaPanda = 'RolexDaytonaPanda'
}
/** 奖励发放状态 */
export enum ClaimStatus {
  /** 待发放 */
  Awarding = 'Awarding',
  /** 已发放 */
  Done = 'Done',
  /** 黑名单用户（不发放） */
  Locked = 'Locked'
}
