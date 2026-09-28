import {
  base64UrlToBuffer,
  bufferToBase64Url,
  isNotAllowedError
} from './webauthn';
import type { PasskeyVerifyFinishRequest, PasskeyVerifyOptionsResponse } from '~/types/passkey';

export { isNotAllowedError };

export type WebAuthnSupportReason = 'ssr' | 'insecure' | 'unsupported';

export type WebAuthnSupportStatus =
  | { ok: true }
  | { ok: false; reason: WebAuthnSupportReason };

function isValidBase64Url(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}

/** 断言（get）场景的支持性检测 */
export function getWebAuthnAssertionSupportStatus(): WebAuthnSupportStatus {
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

/** 组装 PublicKeyCredentialRequestOptions；缺失 challenge_id/challenge/rp_id 任一字段时 throw */
export function buildAssertionPublicKey(
  optionsRes: PasskeyVerifyOptionsResponse
): { challengeId: string; publicKey: PublicKeyCredentialRequestOptions } {
  const challengeId = String(optionsRes?.challenge_id || '');
  const challengeStr = String(optionsRes?.challenge || '');
  const rpIdRaw = String(optionsRes?.rp_id || '');

  if (!challengeId || !challengeStr || !rpIdRaw) {
    throw new Error(
      'Invalid passkey verify options: missing challenge_id/challenge/rp_id'
    );
  }
  if (!isValidBase64Url(challengeStr)) {
    throw new Error(
      'Invalid passkey verify options: challenge is not valid base64url'
    );
  }

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
    ...(typeof optionsRes.timeout === 'number' ? { timeout: optionsRes.timeout } : {})
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

export function buildFinishRequest(
  scene: string,
  challengeId: string,
  assertion: ReturnType<typeof serializeAssertionCredential>
): PasskeyVerifyFinishRequest {
  return {
    scene,
    challenge_id: challengeId,
    credential_id: assertion.credential_id,
    client_data_json: assertion.client_data_json,
    authenticator_data: assertion.authenticator_data,
    signature: assertion.signature
  };
}
