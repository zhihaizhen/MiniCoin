/**
 * Interface of Campaign Info from Activity Info API
 */
export interface ICampaignInfo {
  enrolled?: boolean;
  detail?: {
    id?: number;
    campaign_id?: string;
    act_name?: string;
    act_start_at?: string;
    act_end_at?: string;
    enroll_start_at?: string;
    enroll_end_at?: string;
    count?: number;
    status?: number;
    creator_id?: number;
    creator?: string;
    department?: string;
    reviewer_id?: number;
    reviewer?: string;
    created_at?: string;
    updated_at?: string;
    ext?: any;
  };
  ext?: any;
  now: string;
}

/**
 * Interface of User Trading Info
 */
export interface IUserTradingInfo {
  benchmark_trading_volume: string;
  user_id: number | string;
  rank_id: number;
  trade_volume: string;
  growth_trading_volume_tier_cashback: string;
  growth_rate_percen: string;
  prize_pool_weight: number;
  growth_rate: string;
  tier: string;
  growth_trading_volume_tier_percen: string;
  growth_trading_volume_tier: string;
  growth_trading_volume: string;
  date: string;
}
