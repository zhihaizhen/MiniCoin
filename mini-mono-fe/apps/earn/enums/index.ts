
export enum TopCategoryEnum {
  SAVING = 'SAVING', // 理财宝
  ONCHAIN = 'STAKING_ONCHAIN', // 链上赚币
  SIMPLE = 'SIMPLE_EARN' // 简单赚币
}

/**
 * 理财期限
 */
export enum CategoryEnum {
  ALL = 'all', // 全部期限
  LIQUID = 'liquid', // 活期
  FIXED = 'fixed', // 定期
}

/**
 * 产品标签 该标签分两个字段 product_tag: 新手、普通 product_type: 定期、活期、抢购， 后端接口设计
 */
export enum TagEnum {
  NEWBIE = 'newbie',// 新手
  NORMAL = 'normal', // 普通
  VIP = 'vip', // vip
  RUSH = 'rush', // 抢购
  DEFI = 'defi', // defi
  POS = 'pos', // 标准质押
  LIQUID = 'liquid', // 活期
  FIXED = 'fixed', // 定期
}

/**
 * 收益模式
 */
export enum PnlTypeEnum {
  DAILY = "daily_send", // 每日派息
  T1 = "t1_send" // 到期派息
}

/**
 * 产品状态
 */
export enum ProductStatusEnum {
  RUNNING = 'runing', // 进行中
  COMPLETED = 'completed', // 已完成
  STOPPED = 'stopped' // 已结束
}


/**
 * 借贷期限
 */
export enum LoanDaysEnum{
  NO_DAY = 'loan_days_0',
  SEVEN_DAY = 'loan_days_7',
  THIRTY_DAY = 'loan_days_30',
}

/**
 * loan订单状态
 */
export enum OrderStatusEnum {
  ACTIVE = 'active', // 进行中
  REPAYING = 'repaying', // 还款中
  REPAID = 'repaid', // 已还款
  OVERDUE = 'overdue', // 已逾期
  LIQUIDATED = 'liquidated' // 已强平
}
