import {
  AwardType,
  CampaignStatus,
  ClaimStatus,
  ProductType,
  RegisterStatus,
  TaskAuditStatus,
  TaskEvent,
  TaskStatus,
  VisibleStatus
} from '~/enums';


export interface CampaignDetail {
  campaign_no: string;
  campaign_name: string;

  campaign_begin_time: string;
  campaign_end_time: string;
  claim_begin_time: string;
  claim_end_time: string;

  campaign_status: CampaignStatus;
  is_register: RegisterStatus;
  register_time: string;

  user_sum_points: string;
  invite_num: string;
  task_id: string;
  task_status: TaskStatus;
  task_items: TaskItem[];
}

export interface TaskItem {
  task_event: TaskEvent | string; // 预留兜底
  product_type: ProductType | string;

  today_archive_value: string; // 今日实际值
  today_compare_value?: string; // 今日目标值
  today_points: string; // 今日积分
  today_sum_points: string; // 总积分

  today_tasks: TaskDetail[];
  task_done_num: string;
  task_num: string;
}

export interface TaskDetail {
  task_name: string;
  campaign_name: string;

  task_status: TaskStatus | string;

  task_begin_time: number;
  task_end_time: number;

  award_token: string;
  award_volume: number;

  task_id: number;
  del_flag: number;

  process_bar: number;

  compare_value: string;
  show_archive_value: string;
  archive_value: string;

  action: string;
  visible: VisibleStatus;

  social_btn_name: string;
  social_btn_link: string;

  task_event: TaskEvent | string;
  indicator_type: string;
  product_type: ProductType | string;

  task_audit_status: TaskAuditStatus | string;
}

export interface ITime {
  day: string;
  hour: string;
  min: string;
  sec: string;
}

export interface AwardItem {
  id: string;
  points_cost: string; // 兑换所需积分
  award_limit: string; // 奖品兑换数量
  user_award_limit: string; // 用户剩余兑换数量
  is_close: boolean; // 是否关闭兑换
  award_type: AwardType;
  award_item_type: string;
  award_token: string;
  award_amount: string;
  auto_distribute: 0 | 1; // 是否客服发放，0自动发放，1联系客服发放
}


export interface Record {
  /** 奖励币种 */
  award_token: string;
  /** 奖励类型 */
  award_type: AwardType | '';
  award_item_type: string;
  /** 奖励金额 */
  award_amount: string;
  /** 发放状态 */
  claim_status: ClaimStatus;
  /** 发放时间（UTC 秒级时间戳） */
  claim_dt: number;
}


export interface RewardItem {
  /** 唯一标识（方便埋点 / 发奖） */
  id?: string;

  /** 奖励类型 */
  award_type: AwardType;
  award_item_type?: string;

  /** 数量 */
  award_amount: number | string;

  /** 币种 */
  award_token: string;
}
