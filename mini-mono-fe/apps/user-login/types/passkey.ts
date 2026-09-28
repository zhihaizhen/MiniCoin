// apps/user-login/types/passkey.ts
// Passkey 登录场景的请求/响应类型定义

/** 获取登录挑战（login/options）的请求参数 */
export interface PasskeyLoginOptionsRequest {
  login_mode: 'discoverable';
  device_id: string;
}

/** allowCredentials 单项（兼容 camelCase / snake_case） */
export interface PasskeyAllowCredentialItem {
  id: string;
  type?: string;
  transports?: string[];
}

/** 获取登录挑战（login/options）的响应结果 */
export interface PasskeyLoginOptionsResponse {
  challenge_id: string;
  challenge: string;
  rp_id: string;
  /** 后端实际返回 snake_case；camelCase 兼容旧契约 */
  allow_credentials?: PasskeyAllowCredentialItem[];
  allowCredentials?: PasskeyAllowCredentialItem[];
  timeout?: number;
  [key: string]: unknown;
}

/** 提交登录（login）的请求参数 */
export interface PasskeyLoginRequest {
  challenge_id: string;
  credential_id: string;
  authenticator_data: string;
  client_data_json: string;
  signature: string;
}

/** 提交登录（login）的响应结果 */
export interface PasskeyLoginResponse {
  user_id?: string | number;
  /**
   * 以下字段为 OAuth 登录（postOauthLogin）专属字段。
   * 按 Requirement 5.6/5.7，Passkey 登录场景下即使响应体包含这些字段也必须忽略，
   * 此处声明仅为类型完整性说明，不代表组件会读取它们。
   */
  is_new_user?: string | boolean;
  bind_token?: string;
  [key: string]: unknown;
}

/** 组装后的 WebAuthn 断言请求参数 */
export interface AssertionPublicKeyResult {
  challengeId: string;
  publicKey: PublicKeyCredentialRequestOptions;
}

/** 断言序列化结果 */
export interface SerializedAssertion {
  credential_id: string;
  authenticator_data: string;
  client_data_json: string;
  signature: string;
}
