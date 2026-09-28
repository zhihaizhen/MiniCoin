export enum ACTIVE_STATUS {
  NOT_START = 0, // 活动未开始
  RUNING = 1, // 活动进行中
  END = 2 // 活动已结束
}

export enum RED_ACTIVE_STATUS {
  NOT_START = "1", // 活动未开始
  RUNING = "0", // 活动进行中
  END = "2" // 活动已结束
}

export enum REGISTER_STATUS {
  UNKOWN = "unkown", // 未报名
  ADJUST = "audit", // 审核中
  APPROVED = "approved", // 审核通过
  REJECTED = "rejected", // 审核未通过
}

export enum REWARD_STATUS {
  NOT_GET = "0", // 红包未领取
  GETED = "1", // 红包已领取
  UNTIME = "2" // 未在领取时间
}

export enum ProductType {
  Contract = 'Contract',
  Spot = 'Spot'
}

export enum CouponType {
  PostGivenCash = 'PostGivenCash', // 体验金
  ServiceCash = 'ServiceCash' // 抵扣金
}
