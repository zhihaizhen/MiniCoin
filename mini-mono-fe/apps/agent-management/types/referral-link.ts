export interface IReferralLink {
  id: number;
  siteId: string;
  user_id: number;
  inviteCode: string;
  rebateRate: number;
  invitedRebateRate: number;
  totalRebateRate: number;
  description: number;
  inviteNum: number;
  availableMode: string;
  createTime: number;
  updateTime: number;
  dbUpdateTime: string;
  defaultFlag: number;
}

export interface IReqReferralLinkList {
  pageSize?: number;
  pageNum?: number;
}
export interface IRespReferralLinkList {
  records: IReferralLink[];
  total: number;
  size: number;
  current: number;
  orders: any[];
  optimizeCountSql: boolean;
  searchCount: boolean;
  countId: number;
  maxLimit: number;
  pages: number;
}

export interface IReqReferralLinkAdd {
  default_flag?: number;
  description?: string;
  invited_rebate_rate?: number;
  rebate_rate?: number;
}

export interface IReqReferralLinkEdit {
  invite_code: string;
  default_flag?: number;
  description?: string;
  invited_rebate_rate?: number;
  rebate_rate?: number;
}

export interface IReqSetDefault {
  inviteCode: string;
}
export interface IReqInviteCodeAction {
  invite_code: string;
}
