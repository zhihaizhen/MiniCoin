export interface IResOpenApiItem {
  id: number;
  api_name: string;
  api_key: string;
  created_at: number; // 2023-11-14T10:48:58
  is_readonly: 0 | 1; // 0: read, 1:read and write;
}

export interface IResOpenApiCreate {
  api_name: string;
  api_key: string;
  api_secret: string;
  is_readonly: 0 | 1; // 0: read, 1:read and write;
}

export interface IResOpenApiDetail extends IResOpenApiCreate {
  ips: string[];
}

export interface IApiTableDataType {
  api_name: string;
  api_key: string;
  is_readonly: 0 | 1; // 0: read, 1:read and write;
  created_at: number;
  action: string;
}

export interface IUserProfile {
  address: string;
  ban_status: any;
  created_at: string;
  currency_code: string;
  double_confirm: string;
  email_is_verified: boolean;
  id: number;
  nick_name: string;
  notification_language: string;
  platform: string;
  status: string;
  username: string;
  wallet_name: string;
  wallet_type: number;
}

export interface IbindTypes {
  scenes: 'bind_opt_scenes' | 'unbind_opt_scenes';
  operation: 'email' | 'mobile' | 'twofa' | '2fa';
  operation_data: {
    email?: string; // 要操作的邮箱
    email_code?: string; // 要操作的邮箱时 传
    country_code?: string; // 要操作手机号时 传
    area_code?: string; // 要操作手机号时 传
    mobile?: string; // 手机号
    mobile_code?: string;
    twofa_secret?: string; // 2fa
    twofa_code?: string;
    passkey_code?: string;
  };
}

export type NotificationType =
  | 'EMAIL_ACTIVITY' | 'EMAIL_TP_SL' | 'EMAIL_LIQUIDATION'
  | 'EMAIL_VOUCHER' | 'EMAIL_ASSET'
  | 'APP_PUSH_ACTIVITY' | 'APP_PUSH_TP_SL' | 'APP_PUSH_LIQUIDATION'
  | 'APP_PUSH_VOUCHER' | 'APP_PUSH_ASSET'
  | 'APP_BC_CONTRACT_QUOTE' | 'APP_BC_BLOCK_QUOTE' | 'APP_BC_ACTIVITY';

export interface INotificationSwitches {
  [key: string]: boolean;
}

export interface INotificationSettingsResponse {
  notification_switches: INotificationSwitches;
  night_dnd_switch: boolean;
  night_dnd_start_time: string;
  night_dnd_end_time: string;
}

// KYC 状态类型
export type KycStatus = 'unknown' | 'pending' | 'passed' | 'rejected';

// KYC 证件类型
export type IdentityType = 'passport' | 'id_card' | 'drivers';

// KYC 数据接口
export interface IKycData {
  kyc_status: KycStatus;
  kyc_level?: number;
  country?: string;
  first_name?: string;
  last_name?: string;
  identity_number?: string;
  identity_type?: IdentityType;
  identity_front?: string;
  identity_back?: string;
  identity_person?: string;
  dob?: string;
  reject_reason?: string;
}
