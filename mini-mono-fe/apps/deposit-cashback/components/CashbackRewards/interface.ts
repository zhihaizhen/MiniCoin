// 奖励状态类型
export type RewardStatus = 'Locked' | 'Init' | 'Awarding' | 'Done';

// 奖励项数据类型
export interface RewardItem {
  id: string;
  amount: string;
  currency: string;
  date: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  status: RewardStatus;
  buttonText: string;
  buttonIcon?: string;
}

// Tab类型
export type TabType = 'All' | 'Locked' | 'Init' | 'Awarding' | 'Done';