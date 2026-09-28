// apps/user-login/utils/passkey/base64url.ts

/** base64url 字符串解码为 ArrayBuffer */
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

/** ArrayBuffer 编码为 base64url 字符串（不含 +、/、= ） */
export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/** 校验字符串是否为合法 base64url 编码（供组装函数在解码前做前置校验） */
export function isValidBase64Url(value: string): boolean {
  if (!value) return false;
  return /^[A-Za-z0-9_-]+$/.test(value);
}
