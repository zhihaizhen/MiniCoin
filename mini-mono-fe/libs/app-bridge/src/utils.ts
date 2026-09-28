// if currentVersion < targetVersion: return -1,
// if currentVersion > targetVersion: return 1,

import { I18N_URL_REGEX } from '@better-bit-fe/base-utils';

// if currentVersion = targetVersion: return 0
export const compareAppVersion = (currentVersion, targetVersion) => {
  const arrayCurrent = currentVersion.split('.');
  const arrayTarget = targetVersion.split('.');

  let pointer = 0;
  while (pointer < arrayCurrent.length && pointer < arrayTarget.length) {
    const res = arrayCurrent[pointer] - arrayTarget[pointer];
    if (res === 0) {
      pointer++;
    } else {
      return res > 0 ? 1 : -1;
    }
  }
  // 若arrayA仍有小版本号
  while (pointer < arrayCurrent.length) {
    if (+arrayCurrent[pointer] > 0) {
      return 1;
    } else {
      pointer++;
    }
  }
  // 若arrayB仍有小版本号
  while (pointer < arrayTarget.length) {
    if (+arrayTarget[pointer] > 0) {
      return -1;
    } else {
      pointer++;
    }
  }
  // 版本号完全相同
  return 0;
};

export const targetVer = '3.6.1';
export const defaultLang = 'en-US';
export const BRANCH_IO_KEY = 'key_live_mcV7BFu5VyWaLCcCUXdjugpgxFf0dcfh';
export const DOM_ID = 'branch-script';
export const LOGO_URL = '';

export const getLangFromUrl = () => {
  let pathname = '';
  if (process.browser) {
    pathname = window.location.pathname; // eslint-disable-line
    const matched = pathname.match(I18N_URL_REGEX);
    const currentLangFromUrl = matched && matched[1];
    return !currentLangFromUrl || currentLangFromUrl === defaultLang
      ? defaultLang
      : currentLangFromUrl;
  }
};
