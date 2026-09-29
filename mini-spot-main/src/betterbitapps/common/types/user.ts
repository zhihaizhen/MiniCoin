export interface IUserKline {
  closePositionTipStatus?: string;
  cancelOrderTipStatus?: string;
}

export interface IUserInfo {
  double_confirm?: string;
}


export interface IUser {
  kline: IUserKline;
  info: IUserInfo;
}
