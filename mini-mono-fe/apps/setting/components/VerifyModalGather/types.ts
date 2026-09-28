/**
 * 验证场景，传给 getVerifyQueue 接口获取对应的验证队列
 * - bind_*    绑定操作 → required 模式
 * - unbind_*  解绑操作 → required 模式
 * - withdraw / reset_password / openapi / passkey(delete) → select 模式（3选2）
 * - passkey(create) → 固定邮箱 + 谷歌，缺绑定走「去认证」
 */
export type VerifyScene =
  | 'reset_password'
  | 'bind_mobile'
  | 'unbind_mobile'
  | 'bind_email'
  | 'unbind_email'
  | 'unbind_2fa'
  | 'withdraw'
  | 'openapi'
  | 'passkey';

/**
 * 验证模式
 * - required: 有必选项（接口 required 字段），剩余从 strong_factor 中可选
 * - select:   无必选项，从 strong_factor 中自选 N 个（N = strong_factor_min_pass）
 */
export type VerifyMode = 'required' | 'select';

/** getVerifyQueue 返回的单个验证方式 */
export interface VerifyQueueItem {
  id: string;
  /** 验证类型：email_code | mobile_code | 2fa_code */
  type: string;
  /** 排序优先级，数值越小越靠前 */
  priority: number;
  /** 是否需要先发送验证码（2fa_code 为 false） */
  send_required: boolean;
}

/** getVerifyQueue 接口完整返回结构 */
export interface VerifyQueueData {
  /** 必选验证项（required 模式下使用） */
  required: VerifyQueueItem[];
  /** 可选验证项 */
  strong_factor: VerifyQueueItem[];
  /** 最少需要通过的 strong_factor 数量 */
  strong_factor_min_pass: number;
}
