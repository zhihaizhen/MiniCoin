import { CategoryEnum, OrderStatusEnum, PnlTypeEnum, TagEnum, TopCategoryEnum } from '~/enums';

/**
 * 参考年化等级——活期
 */
export interface LevelAprProps {
  apr: string;
  max_investment_quota: number;
  min_investment_quota: number;
}

/**
 * 理财产品
 */
export interface ProductProps {
  id: string;
  coin: string;
  max_apr: string;
  min_apr: string;
  category: CategoryEnum;
  product_tag: TagEnum;
  duration_days: number;
  fixed_apr: string;
  precision_digits: string;
  product_type: TagEnum;
  subscribe_start_at: number;
  subscribe_end_at: number;
  min_investment_quota: string;
  max_investment_quota: string;
  allow_invest_quota: string;
  level_apr: Array<LevelAprProps>;
  top_category: TopCategoryEnum;
}

/**
 * 产品分组
 */
export interface ProductGroupProps {
  // product_name: string;
  product_category: TopCategoryEnum;
  product_tag: TagEnum;
  product_item: Array<ProductProps>;
}

export interface DefiAprProps {
  reward_coin: string; //奖励币种
  reward_amount: number; //奖励币种数量
  reward_apr: string; //奖励币种apr
  apr: string;  //defi_apr
}

/**
 * 产品详情
 */
export interface ProductDetailProps {
  coin: string;                    // 币种，例如 USDT
  category: CategoryEnum;          // 产品类别：fixed 或 liquid
  product_type: CategoryEnum | TagEnum;     // 类型
  precision_digits: string;        // 精度
  return_coin: string;             // 返还币种
  product_tag: TagEnum;         // 产品标签
  apr_type: string;

  fixed_apr: string;               // 固定 APR（如 "0.12"）
  level_apr?: LevelAprProps[];      // 阶梯 APR (当 apr_type=level 时出现)

  duration_days: number;           // 期限天数

  position_size: string;           // 用户已持仓
  person_allow_quota: string;      // 用户剩余可投
  allow_invest_quota: number;      // 产品剩余可投
  sold_quota: string;              // 已售
  total_quota: string;             // 总额度

  pnl_type: PnlTypeEnum;               // 收益模式

  subscribe_start_at: number;      // 申购开始时间戳
  subscribe_end_at: number;        // 申购结束时间戳

  min_investment_quota: number;    // 单笔最小申购
  max_investment_quota: number;    // 单笔最大申购
  product_defi_name?: string; //defi平台名称
  defi_reference_apr?: string;//defi参考apr 为奖励币种apr加上defi_apr
  defi_apr?: DefiAprProps;
}

/**
 * 简单赚币
 */
export interface ISimpleEarnProduct {
  id: number;                 // 产品ID
  coin: string;               // 币种
  precision_digits: string;   // 精度，如 0.00000001
  return_coin: string;        // 收益币种
  product_tag: string;        // 产品标签
  product_type: string;       // 产品类型
  category: string;           // 顶级分类
  apr_type: string;           // APR类型 (fixed / liquid 等)
  fixed_apr: string;          // 固定APR
  level_apr: any | null;      // APR分层列表
  max_apr: string;            // 最大APR
  min_apr: string;            // 最小APR
  is_recommend: 'Y' | 'N';    // 是否推荐
  auto_renew: boolean;         // 是否开启自动续投 ("true" | "false")
}


export interface ITime {
  day: string;
  hour: string;
  min: string;
  sec: string;
}

export interface IPositionItem {
  id: number;
  product_id: number;
  coin: string;
  apr_type: string;
  product_tag: string;
  auto_renew: boolean;
  product_category: string;
  product_type: string;

  position_size: string;        // 持仓数量
  duration_days: number;        // 持仓周期
  precision_digits: string;     // 精度

  position_status: string;      // 仓位状态

  fixed_apr: string;
  level_apr: [] | null;

  pnl_type: string;             // 利率结算方式

  total_pnl: string;            // 总收益
  yesterday_pnl: string;        // 昨日收益

  interest_calculation_start_at: number; // 派息开始时间
  interest_calculation_end_at: number;   // 到期时间

  min_redeem_value: string;     // 最小赎回数量

  created_at: number;
  updated_at: number;
}

export interface IPositionGroup {
  name: string;          // 产品名称
  coin: string;          // 币种
  all_position: string;  // 总持仓
  data: IPositionItem[];
}

export interface BorrowCoinConfig {

  /** 币种类型 */

  coin_type: "borrow" | "pledge";

  /** 币种 */

  coin: string;

  /** 精度位数 */

  precision_digits: number;

  /** 单次最小借款额度 */

  min_investment_quota: string;

  /** 个人上限 */

  individual_cap: string;

  /** 活期固定年化 */

  liquid_fixed_interest_rate: string;

  hour_liquid_fixed_interest_rate: string;

  /** 7天固定年化 */

  days_7_interest_rate: string;
  hour_days_7_interest_rate: string;

  /** 30天固定年化 */

  days_30_interest_rate: string;
  hour_days_30_interest_rate: string;

  /** 币种价格 当前标记价格 */
  price: string;

  /** 是否下线 1 代表已下线 0 正常 */
  is_delivery: number;

  /** 支持质押币种 */
  support_pledge_coins: string[];

}


export interface PledgeCoinConfig {
  /** 币种类型 */
  coin_type: "pledge";

  /** 币种 */
  coin: string;

  /** 初始质押率 */
  initial_pledge_rate: string;

  /** 预警质押率 */
  early_warning_pledge_rate: string;

  /** 强平质押率 */
  force_liquidate_pledge_rate: string;

  /** 个人最大质押数量 */
  individual_cap: string;

  /** 当前价格（标记价格） */
  price: string;

   /** 精度 */
  precision_digits: number
  /** 是否下线 1 代表已下线 0 正常 */
  is_delivery: number
}


export interface LoanBorrowParams {
  /** 质押币种 */
  pledge_coin: string;

  /** 质押数量 */
  pledge_amount: string;

  /** 借贷币种 */
  borrow_coin: string;

  /** 借贷数量 */
  borrow_amount: string;

  /**
   * 利息类型
   * liquid: 活期
   * fixed: 定期
   */
  duration_type: "liquid" | "fixed";

  /**
   * 定期天数
   * 当 duration_type = "fixed" 时生效
   */
  duration_days?: string;

  /** 质押率 */
  ltv: string;

  /**
   * 自动补仓
   * 0: 否
   * 1: 是
   */
  automatic_replenishment: 0 | 1;
}

/**
 * 借贷进行中的订单
 */
export interface LoanOrderProp {
  /** 仓位 ID */
  position_id: number;

  /** 产品类型：liquid = 活期，fixed = 定期 */
  duration_type: "liquid" | "fixed";

  /** 借款期限，活期为 0，定期为 7 或 30（天） */
  duration_days: number;

  /** 借款币种，本期为 USDT */
  borrow_coin: string;

  /** 质押币种，本期为 BTC、ETH */
  pledge_coin: string;

  /** 初始借款本金 */
  borrow_amount: string;

  /** 当前未还本金 */
  unpaid_principal: string;

  /** 当前未还利息 */
  unpaid_interest: string;

  /** 当前总负债（未还本金 + 未还利息） */
  total_borrow_amount: string;

  /** 当前质押数量 */
  pledge_amount: string;

  /** 当前质押币价格 */
  current_pledge_price: string;

  /** 当前借款币价格，USDT 通常为 1 */
  current_borrow_price: string;

  /** 当前质押率 */
  current_ltv: string;

  /** 初始质押率 */
  initial_ltv: string;

  /** 预警质押率 */
  warning_ltv: string;

  /** 强平质押率 */
  liquidation_ltv: string;

  /** 触发预警时的质押币价格 */
  warning_price: string;

  /** 触发强平时的质押币价格 */
  liquidation_price: string;

  /** 利率类型，例如 "fixed" */
  interest_rate_type: "fixed" | "floating";

  /** 固定年化利率 */
  interest_rate_fixed: string;

  /** 年化利率 */
  year_rate: string;

  /** 小时利率 */
  hour_rate: string;

  /** 风险等级：normal = 正常，warning = 预警，liquidation = 强平 */
  risk_level: "normal" | "warning" | "liquidation";

  /** 订单状态 */
  order_status: OrderStatusEnum;

  /** 是否开启自动补仓：0 = 关闭，1 = 开启 */
  automatic_replenishment: 0 | 1;

  /** 计息开始时间，毫秒时间戳 */
  interest_start_at: number;

  /** 最近一次计息时间，毫秒时间戳 */
  interest_last_calc_at: number;

  /** 创建时间，毫秒时间戳 */
  created_at: number;

  /** 到期时间，活期返回 0 */
  maturity_at: number;

   /** 精度位数 */
  borrow_coin_precision_digits: number;
  pledge_coin_precision_digits: number;

}


export interface RepayResultProp {

  /** 借款币种，例如 "USDT" */
  borrow_coin: string;

  /** 还款总额（本金 + 利息 + 罚息） */
  repay_amount: string;

  /** 还款本金 */
  repay_principal: string;

  /** 还款利息 */
  repay_interest: string;

  /** 还款罚息 */
  repay_interest_fine: string;

  /** 质押币种，例如 "BTC" */
  pledge_coin: string;

  /** 释放的质押币数量 */
  released_pledge_amount: string;

  /** 产品类型：liquid = 活期，fixed = 定期 */
  duration_type?: "liquid" | "fixed";
}


export interface AdjustResultProp {
  coin: string;

  /** 调整后的质押率 */
  current_ltv: string;

  /** 调整数量 */
  change_pledge_amount: string;

  type: "add" | "reduce";
}

/**
 * 借款成功反馈
 */
export interface BorrowCallBackProp {
  borrow_amount: string
  borrow_coin: string
  /** 产品类型：liquid = 活期，fixed = 定期 */
  duration_type: "liquid" | "fixed";
  interest_end_at: number
  ltv: string
  pledge_amount: string
  pledge_coin: string
  year_rate: string
  duration_days: string
}
