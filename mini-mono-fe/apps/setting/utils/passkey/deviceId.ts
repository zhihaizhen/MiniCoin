const DEVICE_ID_KEY = 'easicoin_passkey_device_id';
export const CURRENT_CREDENTIAL_KEY = 'easicoin_passkey_current_credential_id';

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** web 端首次生成并长期保存在 localStorage 的 device_id */
export function getOrCreatePasskeyDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = createUuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return createUuid();
  }
}

export function setCurrentPasskeyCredentialId(credentialId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_CREDENTIAL_KEY, credentialId);
  } catch {
    // ignore
  }
}

export function getCurrentPasskeyCredentialId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CURRENT_CREDENTIAL_KEY) || '';
  } catch {
    return '';
  }
}
