// apps/user-login/utils/passkey/webauthn.ts
import {
  base64UrlToBuffer,
  bufferToBase64Url,
  isValidBase64Url
} from './base64url';
import type { PasskeyLoginOptionsResponse } from '~/types/passkey';

export type WebAuthnSupportReason = 'ssr' | 'insecure' | 'unsupported';

export type WebAuthnSupportStatus =
  | { ok: true }
  | { ok: false; reason: WebAuthnSupportReason };

/**
 * 检测当前环境是否支持 WebAuthn 断言（get）。
 * 与 apps/setting 的 getWebAuthnSupportStatus 逻辑等价，独立实现。
 * 检测过程中任何环节抛出异常均归类为「不支持」，不向外抛出未捕获异常（Requirement 2.5）。
 */
export function getWebAuthnSupportStatus(): WebAuthnSupportStatus {
  try {
    if (typeof window === 'undefined') {
      return { ok: false, reason: 'ssr' };
    }
    if (!window.isSecureContext) {
      return { ok: false, reason: 'insecure' };
    }
    const canGet =
      typeof window.PublicKeyCredential !== 'undefined' &&
      !!navigator.credentials &&
      typeof navigator.credentials.get === 'function';
    if (!canGet) {
      return { ok: false, reason: 'unsupported' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unsupported' };
  }
}

/** 判断异常是否为用户在系统凭据选择器中主动取消操作所抛出的 NotAllowedError */
export function isNotAllowedError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name?: string }).name === 'NotAllowedError'
  );
}

/**
 * 组装 discoverable 登录场景的 PublicKeyCredentialRequestOptions。
 * 对应 apps/setting 中 buildCreationPublicKey 的登录场景版本，独立实现。
 *
 * 契约（Requirement 3.5/3.6/4.1-4.4）：
 * - 缺失 challenge_id / challenge / rp_id 任一字段，或 challenge 非合法 base64url，均抛出异常
 * - allowCredentials 为空/未返回时不设置该字段，触发浏览器 discoverable 流程
 * - timeout 存在则填入，不存在则不设置
 */
export function buildAssertionPublicKey(
  optionsRes: PasskeyLoginOptionsResponse
): { challengeId: string; publicKey: PublicKeyCredentialRequestOptions } {
  const challengeId = String(optionsRes?.challenge_id || '');
  const challengeStr = String(optionsRes?.challenge || '');
  const rpIdRaw = String(optionsRes?.rp_id || '');

  if (!challengeId || !challengeStr || !rpIdRaw) {
    throw new Error(
      'Invalid passkey login options: missing challenge_id/challenge/rp_id'
    );
  }
  if (!isValidBase64Url(challengeStr)) {
    throw new Error(
      'Invalid passkey login options: challenge is not valid base64url'
    );
  }

  // 后端 login/options 返回 allow_credentials（snake_case）
  const allowCredentialsRaw =
    optionsRes.allow_credentials ?? optionsRes.allowCredentials;
  const allowCredentials =
    Array.isArray(allowCredentialsRaw) && allowCredentialsRaw.length > 0
      ? allowCredentialsRaw.map((item) => ({
          id: base64UrlToBuffer(item.id),
          type: (item.type || 'public-key') as PublicKeyCredentialType,
          transports: item.transports as AuthenticatorTransport[] | undefined
        }))
      : undefined;

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: base64UrlToBuffer(challengeStr),
    rpId: rpIdRaw,
    allowCredentials,
    userVerification: 'preferred',
    ...(typeof optionsRes.timeout === 'number'
      ? { timeout: optionsRes.timeout }
      : {})
  };

  return { challengeId, publicKey };
}

export async function getAssertion(
  publicKey: PublicKeyCredentialRequestOptions
): Promise<PublicKeyCredential | null> {
  const credential = await navigator.credentials.get({ publicKey });
  if (!credential || credential.type !== 'public-key') return null;
  return credential as PublicKeyCredential;
}

/**
 * 将 navigator.credentials.get 返回的 PublicKeyCredential 序列化为接口所需字段。
 * 对应 apps/setting 中 serializeCredential 的登录场景版本，独立实现。
 */
export function serializeAssertionCredential(cred: PublicKeyCredential): {
  credential_id: string;
  authenticator_data: string;
  client_data_json: string;
  signature: string;
} {
  const response = cred.response as AuthenticatorAssertionResponse;
  return {
    credential_id: bufferToBase64Url(cred.rawId),
    authenticator_data: bufferToBase64Url(response.authenticatorData),
    client_data_json: bufferToBase64Url(response.clientDataJSON),
    signature: bufferToBase64Url(response.signature)
  };
}
