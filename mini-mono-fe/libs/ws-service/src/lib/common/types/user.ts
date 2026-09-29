export interface IUserKline {
  closePositionTipStatus?: string;
  cancelOrderTipStatus?: string;
  reverseClickTipStatus?: string;
}

export interface IUserInfo {
  double_confirm?: string;
}

export interface IUserRiskLimitItem {
  id?: number;
  symbol?: string;
  pair: string;
  side: string;
  limit: number;
  riskId: number;
  positionIdx: number;
  maintainMarginE8?: number;
  startingMarginE8?: number;
}

export interface IUser {
  kline: IUserKline;
  info: IUserInfo;
  riskLimit: IUserRiskLimitItem[];
}
