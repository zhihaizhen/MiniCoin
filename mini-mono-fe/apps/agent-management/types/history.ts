export interface IRebateReferralHistoryInfo {
  coin: string;
  create_time: string;
  dt: string;
  exec_fee: number;
  exec_id: number;
  exec_price: number;
  exec_qty: number;
  exec_value: number;
  last_liquidity_ind: number;
  order_id: number;
  parent_rebate_fee: number;
  parent_rebate_rate: number;
  parent_user_id: number;
  product_name: string;
  rebate_fee: number;
  rebate_rate: number;
  rebate_status: number;
  site_id: number;
  symbol_name: string;
  total_exec_fee: number;
  total_rebate_fee: number;
  total_rebate_rate: number;
  transact_time: number;
  update_time: string;
  user_id: number;
}

export interface IDailyRebateReferralInfo {
  coin: string;
  create_time: string;
  dt: string;
  rebate_fee: number;
  rebate_status: number;
  rebate_type: string;
  site_id: number;
  update_time: string;
  user_id: number;
}

export interface IRebateRewardHistoryInfo {
  coin: string;
  create_time: string;
  dt: string;
  exec_fee: number;
  exec_id: number;
  exec_price: number;
  exec_qty: number;
  exec_value: number;
  last_liquidity_ind: number;
  order_id: number;
  parent_rebate_fee: number;
  parent_rebate_rate: number;
  parent_user_id: number;
  product_name: string;
  rebate_fee: number;
  rebate_rate: number;
  rebate_status: number;
  site_id: number;
  symbol_name: string;
  total_exec_fee: number;
  total_rebate_fee: number;
  total_rebate_rate: number;
  transact_time: number;
  update_time: string;
  user_id: number;
}

export interface IDailyRebateRewardInfo {
  coin: string;
  create_time: string;
  dt: string;
  rebate_fee: number;
  rebate_status: number;
  rebate_type: string;
  site_id: number;
  update_time: string;
  user_id: number;
}
