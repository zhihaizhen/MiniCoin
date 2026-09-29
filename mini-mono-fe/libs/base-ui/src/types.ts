/**
 * Interface of User Info from get Profile
 */

export interface IUserInfo {
  id: string | number;
  username: string;
  vague_email: string;
  vague_mobile: string | number;
  email_verified: boolean;
  mobile_verified: boolean;
  has_google2fa: boolean;
  lang: string;
  status: string;
  avatar?: string;
  country_code?: string;
  currency_code?: string;
  account_label?: null | string;
  double_confirm?: string;
  auto_add_margin?: boolean;
  msg_disable_module_ids?: string;
  use_order_v2?: boolean;
  use_svc_order?: boolean;
  use_webworker?: boolean;
  use_ws2?: boolean;
  use_ws2_for_personal?: boolean;
  ws3_path?: string;
  created_at?: string;
  vip?: {
    is_vip?: boolean;
  };
}
