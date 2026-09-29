import type { PasskeyRegisterOptionsResponse, PasskeySupportConfig } from '~/types/passkey';

export function base64UrlToBuffer(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** 将非 base64url 编码的原始字符串（如本地 userInfo.id）编码为 WebAuthn 需要的 BufferSource */
function stringToBuffer(value: string): ArrayBuffer {
  return new TextEncoder().encode(value).buffer;
}

export type WebAuthnSupportReason = 'ssr' | 'insecure' | 'unsupported';

export type WebAuthnSupportStatus =
  | { ok: true }
  | { ok: false; reason: WebAuthnSupportReason };

/**
 * WebAuthn 仅在安全上下文可用（HTTPS / localhost / 127.0.0.1）。
 * 本地若用 http://dev.test.xxx 访问，PublicKeyCredential 会被浏览器关掉，
 * 应提示 insecure，而不是「浏览器不支持」。
 */
export function getWebAuthnSupportStatus(): WebAuthnSupportStatus {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'ssr' };
  }
  if (!window.isSecureContext) {
    return { ok: false, reason: 'insecure' };
  }
  const PublicKeyCredentialCtor =
    window.PublicKeyCredential ||
    (globalThis as typeof globalThis & { PublicKeyCredential?: typeof PublicKeyCredential })
      .PublicKeyCredential;
  const canCreate =
    typeof PublicKeyCredentialCtor !== 'undefined' &&
    !!navigator.credentials &&
    typeof navigator.credentials.create === 'function';
  if (!canCreate) {
    return { ok: false, reason: 'unsupported' };
  }
  return { ok: true };
}

export function isWebAuthnSupported(): boolean {
  return getWebAuthnSupportStatus().ok;
}

export function isSecurityError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name?: string }).name === 'SecurityError'
  );
}

function buildPubKeyCredParams(preferredAlg?: number): PublicKeyCredentialParameters[] {
  // Chrome 要求至少包含 ES256(-7) 与 RS256(-257)，否则部分认证器无法注册
  const algs = preferredAlg != null ? [preferredAlg, -7, -257] : [-7, -257];
  const unique = Array.from(new Set(algs));
  return unique.map((alg) => ({ type: 'public-key' as PublicKeyCredentialType, alg }));
}

function unwrapOptionsPayload(
  data: PasskeyRegisterOptionsResponse
): PasskeyRegisterOptionsResponse {
  if (data?.options && typeof data.options === 'object') {
    const nested = data.options as PasskeyRegisterOptionsResponse;
    return {
      ...nested,
      challenge_id: data.challenge_id || nested.challenge_id,
      challenge: (data.challenge as string | undefined) || nested.challenge,
      rp_id: data.rp_id || nested.rp_id
    };
  }
  return data;
}

/**
 * 组装 WebAuthn PublicKeyCredentialCreationOptions。
 *
 * - register/options 的 challenge 作为 WebAuthn challenge
 * - challenge_id 仅用于后续 register finish，不当作 challenge
 * - rp_name / timeout / alg 来自 support-config
 * - user.id / user.name 由前端用当前登录用户信息补齐
 */
export function buildCreationPublicKey(
  optionsRes: PasskeyRegisterOptionsResponse,
  supportConfig: PasskeySupportConfig,
  fallbackUser?: { id: string; name: string }
): { challengeId: string; publicKey: PublicKeyCredentialCreationOptions } {
  const raw = unwrapOptionsPayload(optionsRes);
  const challengeId = String(raw.challenge_id || '');
  const challengeStr = String(raw.challenge || '');
  const rpId = String(raw.rp_id || '');
  if (!challengeId) {
    throw new Error('Invalid passkey register options: missing challenge_id');
  }
  if (!challengeStr) {
    throw new Error('Invalid passkey register options: missing challenge');
  }
  if (!rpId) {
    throw new Error('Invalid passkey register options: missing rp_id');
  }

  const hasServerUser = !!raw.user?.id && !!raw.user?.name;
  const user = hasServerUser ? raw.user : fallbackUser;
  if (!user?.id || !user?.name) {
    throw new Error('Invalid passkey register options: missing user');
  }

  const excludeCredentials = (raw.excludeCredentials || []).map((item) => ({
    id: base64UrlToBuffer(item.id),
    type: (item.type || 'public-key') as PublicKeyCredentialType,
    transports: item.transports as AuthenticatorTransport[] | undefined
  }));

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: base64UrlToBuffer(challengeStr),
    rp: {
      id: rpId,
      name: supportConfig.rp_name
    },
    user: {
      // 若后端补回 user.id（base64url）则按 base64url 解码；否则本地用原始字符串编码
      id: hasServerUser ? base64UrlToBuffer(user.id) : stringToBuffer(String(user.id)),
      name: user.name,
      displayName: (user as { displayName?: string }).displayName || user.name
    },
    pubKeyCredParams: buildPubKeyCredParams(supportConfig.alg),
    timeout: supportConfig.timeout || 60000,
    excludeCredentials: excludeCredentials.length > 0 ? excludeCredentials : undefined,
    // 不限制 platform：Chrome 才会弹出「Google 密码管理 / iCloud / 手机」这类选择保存位置的原生窗
    // 安全扫描要求注册强制 userVerification=required，供服务端校验 UV=1
    authenticatorSelection: {
      residentKey: 'preferred',
      ...raw.authenticatorSelection,
      userVerification:
        raw.authenticatorSelection?.userVerification ||
        raw.user_verification ||
        'required'
    },
    attestation: raw.attestation || 'none'
  };

  return { challengeId, publicKey };
}

export async function createPasskey(
  publicKey: PublicKeyCredentialCreationOptions
): Promise<PublicKeyCredential | null> {
  try {
    const credential = await navigator.credentials.create({ publicKey });
    if (!credential) {
      console.warn('[Passkey] credentials.create 返回 null');
      return null;
    }
    if (credential.type !== 'public-key') return null;
    return credential as PublicKeyCredential;
  } catch (error) {
    // 便于本地排查：NotAllowedError 常见于用户取消 / 用户手势已失效 / HTTP 环境不弹窗
    console.error('[Passkey] credentials.create 失败', {
      name: (error as { name?: string })?.name,
      message: (error as { message?: string })?.message,
      rpId: publicKey.rp?.id,
      origin: typeof window !== 'undefined' ? window.location.origin : ''
    });
    throw error;
  }
}

/**
 * 注册完成接口改为提交 attestation，由服务端解析 credential_id / public key。
 * id / raw_id / client_data_json / attestation_object 均使用 base64url。
 */
export function serializeCredential(cred: PublicKeyCredential): {
  id: string;
  raw_id: string;
  type: string;
  client_data_json: string;
  attestation_object: string;
  /** 文档约定：逗号拼接，如 "internal,hybrid" */
  transports: string;
} {
  const attestation = cred.response as AuthenticatorAttestationResponse;
  const transportList =
    typeof attestation.getTransports === 'function'
      ? attestation.getTransports()
      : [];
  const transports = (transportList.length > 0 ? transportList : ['internal']).join(
    ','
  );

  return {
    id: cred.id,
    raw_id: bufferToBase64Url(cred.rawId),
    type: cred.type || 'public-key',
    client_data_json: bufferToBase64Url(attestation.clientDataJSON),
    attestation_object: bufferToBase64Url(attestation.attestationObject),
    transports
  };
}

export function isNotAllowedError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name?: string }).name === 'NotAllowedError'
  );
}
