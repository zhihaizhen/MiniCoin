import { getLang } from 'common/utils/storageData';

const COLOR_PREFERENCE_KEY = 'TRADE_COLOR_PREFERENCE';

export const COLOR_PREFERENCES = {
  GREEN_UP_RED_DOWN: 'greenUpRedDown',
  RED_UP_GREEN_DOWN: 'redUpGreenDown',
  RED_UP_BLUE_DOWN: 'redUpBlueDown',
};

export function getColorPreference() {
  // 从 localStorage 获取用户手动设置的颜色偏好
  const savedPreference = localStorage.getItem(COLOR_PREFERENCE_KEY);

  // 如果用户手动设置过颜色偏好，则使用保存的设置
  if (savedPreference) {
    return savedPreference;
  }

  // 获取当前语言
  const lang = getLang();

  // 如果是韩语，默认使用红涨蓝跌
  if (lang === 'ko-KR') {
    return COLOR_PREFERENCES.RED_UP_BLUE_DOWN;
  }

  // 其他语言默认使用绿涨红跌
  return COLOR_PREFERENCES.GREEN_UP_RED_DOWN;
}

export function setColorPreference(preference) {
  // 保存用户手动设置的颜色偏好到 localStorage
  localStorage.setItem(COLOR_PREFERENCE_KEY, preference);
}
