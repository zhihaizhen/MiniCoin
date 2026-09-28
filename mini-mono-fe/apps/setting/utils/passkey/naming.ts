/** 默认名称：系统-设备-浏览器，如 Macbook-Pro-Chrome */
export function buildDefaultPasskeyName(): string {
  if (typeof navigator === 'undefined') return 'Web-Passkey';

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  let os = 'Web';
  if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) {
    os = /iPhone|iPad/i.test(ua) ? 'iOS' : 'Macbook-Pro';
  } else if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    os = 'Windows-PC';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/Linux/i.test(platform)) {
    os = 'Linux';
  }

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  return `${os}-${browser}`;
}

export function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Web';
  return navigator.platform || 'Web';
}

export function getOsVersion(): string {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';
  const mac = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/i);
  if (mac?.[1]) return mac[1].replace(/_/g, '.');
  const win = ua.match(/Windows NT (\d+\.\d+)/i);
  if (win?.[1]) return win[1];
  const android = ua.match(/Android (\d+(?:\.\d+)?)/i);
  if (android?.[1]) return android[1];
  return '';
}

/** 重命名：≤60 字，中英文、数字、空格、连字符、点 */
export function validatePasskeyName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) return false;
  return /^[\w\u4e00-\u9fa5\-\s.]+$/u.test(trimmed);
}
