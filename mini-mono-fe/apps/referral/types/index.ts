export interface ReferralConfig {
  inviter_rebate_rate: string;
  invitee_rebate_rate: string;
  is_affiliate: boolean;
  affiliate_web_url: string;
}

export interface UserOverviewData {
  rebate_amount: string;
  trade_user_count: string;
  register_user_count: string;
}

export type TimeRange = 'ALL' | 'YESTERDAY' | 'LAST_7D' | 'LAST_30D';

export interface InviteUserRecord {
  user_id: string;
  register_time: string;
  user_rebate_rate: string;
  user_trade_status: boolean;
}

export interface RebateRecord {
  rebate_type: 'Contract' | 'Spot';
  rebate_amount: string;
  trade_time: string;
  rebate_time: string;
}

export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ReferralInfo {
  inviteCode?: string;
  inviteLink?: string;
}
