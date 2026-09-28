import { ProductType, CouponType } from '~/enums';

export interface ICompaignProp {
  campaign_no: string;
  campaign_name: string;
  campaign_begin_time: string;
  campaign_end_time: string;
  campaign_time_status?: string;
  next_reward_time?: string;
  reward_status?: string;
}

export type AwardType = 'VirtualCurrency' | 'Coupons' | string;

export interface RewordProps {
  award_ratio: string;
  award_token: string;
  award_type: string;
  award_amount: string;
  side: string;
  symbol: string;
  close_pz_time: string;
  cur_pz_leverage: string;
  margin_mode: string;
  product_type?: ProductType;
  coupon_type?: CouponType;
}

export interface BaseLotteryRecord {
  id?: string | number;
  award_token: string;
  award_type: string;
  award_amount: string | number;
  claim_dt: string | number;
  claim_status: string;
}

export interface LotteryRecord extends BaseLotteryRecord {
  award_ratio?: string | number;
  product_type: ProductType;
  coupon_type: CouponType;
}

export type RedEnvRecord = LotteryRecord;
