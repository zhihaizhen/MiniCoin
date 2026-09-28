// apps/user-login/utils/passkey/deviceId.ts

/** 与 apps/setting 共用同一 key，保证绑定与登录提交同一 device_id */
const DEVICE_ID_KEY = 'easicoin_passkey_device_id';
/** 历史登录专用 key，读取后迁移到共用 key */
const LEGACY_LOGIN_DEVICE_ID_KEY = 'easicoin_passkey_login_device_id';

function createUuid(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 获取或创建 Passkey Device_Id。
 * 与 apps/setting 共用 localStorage key，避免绑定用 A、登录用 B 导致后端按设备查凭证失败。
 * localStorage 不可用时返回临时 Device_Id，不抛出异常（Requirement 3.3）。
 */
export function getOrCreatePasskeyDeviceId(): string {
  if (typeof window === 'undefined') return createUuid();
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    const legacy = localStorage.getItem(LEGACY_LOGIN_DEVICE_ID_KEY);
    if (legacy) {
      localStorage.setItem(DEVICE_ID_KEY, legacy);
      return legacy;
    }

    const id = createUuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return createUuid();
  }
}
