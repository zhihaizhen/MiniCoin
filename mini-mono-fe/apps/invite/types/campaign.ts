export interface RewardItem {
  task_id: string;
  template_id: string;
  award_token: string;
  award_volume: string;
  reward_product_type: 'Contract' | 'Spot';
  coupon_type: string;
}

export interface TaskItem {
  order_no: number;
  campaign_name: string;
  task_name: string;
  task_title: string;
  task_type: 'Once' | 'Counter';
  task_event: string;
  task_id?: string;
  task_status?: string;
  indicator_type: string;
  product_type: string;
  process_bar: string;
  archive_value: string;
  show_archive_value: string;
  compare_value: string;
  reward_items: RewardItem[];
}

export type CampaignStatus = '0' | '1' | '2' | '3';

export interface CampaignDetail {
  campaign_reward: string;
  campaign_no: string;
  campaign_name: string;
  campaign_begin_time: string;
  campaign_end_time: string;
  campaign_status: CampaignStatus;
  task_items: TaskItem[];
  invitation_reward: string;
  reward_token: string;
  is_register?: '0' | '1';
}

export const TASK_EVENT = {
  ONCE_BE_INVITED: 'once_user_be_invited',
  COUNTER_INVITE_TRADE: 'counter_user_invite_trade_fee_100'
} as const;
