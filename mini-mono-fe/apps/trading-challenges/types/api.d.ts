/**
 * API Hooks 类型定义
 */

// ==================== 充值相关 ====================

export interface DepositNotification {
  user_id: string;
  amount: string;
}

export interface DepositApiResponse {
  records?: DepositNotification[];
}

// ==================== 任务相关 ====================

export interface TaskInfo {
  task_date: number;
  campaign_name: string;
  task_status: 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Expired';
  award_token: string;
  award_volume: number;
  task_id: number;
  process_bar: number;
  compare_value: string;
  archive_value: string;
}

// ==================== 返现相关 ====================

export interface UserCashbackItem {
  id: number;
  currency: string;
  amount: number;
  cashback_time: number; // utc0秒级时间戳
}

export interface UserCashbackParams {
  page_num: number;
  page_size: number;
}

// ==================== 活动相关 ====================

export interface CampaignItem {
  campaign_no: string;
  campaign_path: string;
}

export interface CampaignListResponse {
  data: CampaignItem[];
}

export interface TaskItem {
  id: string;
  task_id?: string; // 任务 ID（用于领取奖励）
  day_no: string;
  task_status?: 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Expired' | 'Pending'; // 任务状态
  has_reward: '0' | '1'; // 是否有奖励 1:有。0:无
  reward_type:
    | 'ServiceCash'
    | 'PreGivenCash'
    | 'RealCash'
    | 'PhysicalAward'
    | 'PostGivenCash'; // 抵扣金 | 先抵扣体验金 | 真金 | 实物奖励 | 后抵扣体验金
  reward_token: string;
  reward_amount: string;
  archive_value?: string; // 当前完成量（已报名状态下返回）
  compare_value?: string; // 目标值
}

export interface CampaignDetail {
  campaign_no: string;
  campaign_name: string;
  archive_value: string; // 当前完成量
  compare_value: string; // 目标值
  current_time?: string; // 当前时间 UTC0秒级时间戳（已报名状态下返回）
  is_record: '0' | '1'; // 是否有领取记录，0否，1是
  is_register: '0' | '1'; // 是否已注册 1:已报名。0:未报名
  campaign_begin_time: string; // UTC0秒级时间戳字符串
  campaign_end_time: string; // UTC0秒级时间戳字符串
  register_begin_time: string; // 报名开始时间
  register_end_time: string; // 报名结束时间
  register_time_status: '0' | '1' | '2'; // 报名时间状态 0:正常进行，1:未开始报名，2:已结束报名
  campaign_time_status: '0' | '1' | '2'; // 活动时间状态 0:正常进行，1:未开始报名，2:已结束报名
  task_items: TaskItem[]; // 接口返回字段名是 task_items
  current_day: string; // 当前第几天
}

// ==================== 奖励相关 ====================

export interface ReceiveAwardParams {
  task_id?: number;
  award_id?: number;
  [key: string]: any;
}

export interface PhysicalAwardData {
  address?: string;
  phone?: string;
  name?: string;
  [key: string]: any;
}

export interface AwardRecord {
  id: number;
  award_name?: string;
  award_type?: string;
  award_amount?: string;
  receive_time?: number;
  [key: string]: any;
}

export interface ReceiveAwardRecordParams {
  page_num?: number;
  page_size?: number;
  campaign_no?: string;
  [key: string]: any;
}

export interface AffiliateLineInfo {
  is_verified?: boolean;
  line_id?: string;
  [key: string]: any;
}
