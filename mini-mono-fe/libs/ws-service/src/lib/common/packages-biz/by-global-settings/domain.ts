import { Env } from '@region-lib/env';

const { LOGO_DARK_HOST, LOGO_LIGHT_HOST, APP_QRCODE_HOST } = Env;
/**
 * some common resource path
 * 注意: LOGO_PATH这里的 dark主题使用白色icon. light主题使用黑色的icon
 */
export const LOGO_PATH = {
  dark: LOGO_DARK_HOST,
  light: LOGO_LIGHT_HOST,
};

export const APP_QR_CODE_PATH = APP_QRCODE_HOST;
