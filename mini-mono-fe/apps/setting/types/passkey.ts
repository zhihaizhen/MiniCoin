export interface PasskeySupportConfig {
  rp_id: string;
  rp_name: string;
  alg: number;
  max_passkey_count: number;
  timeout: number;
}

export interface PasskeyListItem {
  passkey_id: number;
  name: string;
  device_name: string;
  /** 创建时间，秒级时间戳 */
  create_at: number;
  credential_id: string;
  transports?: string[];
}

export interface PasskeyRegisterOptionsRequest {
  name: string;
  device_name: string;
  os_version: string;
  device_id: string;
  email_code?: string;
  mobile_code?: string;
  twofa_code?: string;
}

export interface PasskeyRegisterOptionsResponse {
  challenge_id: string;
  /** WebAuthn rp.id，由 register/options 返回，前端不再按域名写死 */
  rp_id?: string;
  /** WebAuthn challenge（base64url），仅用于 credentials.create，不与 challenge_id 混用 */
  challenge: string;
  user?: {
    id: string;
    name: string;
    displayName?: string;
  };
  excludeCredentials?: Array<{
    id: string;
    type?: string;
    transports?: string[];
  }>;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  /** options 要求前端使用 required，服务端 finish 校验 UV=1 */
  user_verification?: UserVerificationRequirement;
  attestation?: AttestationConveyancePreference;
  options?: Omit<PasskeyRegisterOptionsResponse, 'challenge_id' | 'options'>;
  [key: string]: unknown;
}

/** POST /user/private/v1/passkey/register：服务端从 attestation 解析 credential，不再信任客户端公钥 */
export interface PasskeyRegisterRequest {
  challenge_id: string;
  name: string;
  device_name: string;
  device_id: string;
  os_version: string;
  /** WebAuthn transports，逗号拼接字符串，如 "internal,hybrid" */
  transports: string;
  id: string;
  raw_id: string;
  type: string;
  client_data_json: string;
  attestation_object: string;
}

export interface PasskeyEditRequest {
  passkey_id: number;
  name: string;
}

export interface PasskeyDeleteRequest {
  passkey_id: number;
  email_code?: string;
  mobile_code?: string;
  twofa_code?: string;
}

/** GET /user/private/v1/passkey/scene-config 单条配置 */
export interface PasskeySceneConfigItem {
  scene: string;
  scene_name: string;
  enabled: boolean;
  amount_limit_enabled: boolean;
  amount_limit: string;
  amount_currency: string;
  fallback_required: boolean;
}

export interface PasskeySceneConfigResponse {
  configs: PasskeySceneConfigItem[];
}

export interface PasskeyVerifyOptionsRequest {
  /** 后端场景标识，见 VERIFY_SCENE_TO_PASSKEY_SCENE */
  scene: string;
  amount?: string;
  currency?: string;
}

export interface PasskeyVerifyOptionsResponse {
  challenge_id: string;
  challenge: string;
  rp_id: string;
  allowCredentials?: Array<{
    id: string;
    type?: string;
    transports?: string[];
  }>;
  allow_credentials?: Array<{
    id: string;
    type?: string;
    transports?: string[];
  }>;
  timeout?: number;
}

export interface PasskeyVerifyFinishRequest {
  scene: string;
  challenge_id: string;
  credential_id: string;
  client_data_json: string;
  authenticator_data: string;
  signature: string;
}

export interface PasskeyVerifyFinishResponse {
  passkey_code: string;
}
