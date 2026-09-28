import { Env } from '@region-lib/env';
import { guid as Guid } from '@unified/helpers';
import Cookies from 'js-cookie';
import { LANG_KEY, LANGUAGES, getLanguage } from '@region-lib/language';
import { THEMES } from '../packages-biz/by-global-settings';
import { isDex } from './env';

const { TOKEN_KEY, COOKIE_DOMAIN, THEME_KEY, GUID_KEY } = Env;

export function getToken() {
  // TODO: fix better-dex-1 replace
  let formate_TOKEN_KEY = TOKEN_KEY;
  if (isDex) {
    formate_TOKEN_KEY = TOKEN_KEY.replace('better-1', 'better-dex-1');
  }
  return Cookies.get(formate_TOKEN_KEY);
}

export function setToken(token) {
  Cookies.set(TOKEN_KEY, token, { expires: 10080, domain: COOKIE_DOMAIN }); // 有效期 7天
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || THEMES.LIGHT;
}

export function getGuid() {
  let guid = Cookies.get(GUID_KEY);
  if (!guid || guid.length !== 36) {
    guid = Guid();
  }
  Cookies.set(GUID_KEY, guid, {
    expires: 120 * 24 * 60,
    domain: COOKIE_DOMAIN,
    path: '/'
  });

  return guid;
}

export function getLang() {
  if (typeof window === 'undefined') {
    return '';
  } else {
    return getLanguage();
  }
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  Cookies.set(LANG_KEY, lang, {
    domain: COOKIE_DOMAIN,
    path: '/',
    expires: 24 * 60
  });
}

export function getlocalStorage(key) {
  if (!key) return '';
  try {
    let value = localStorage?.getItem(key) || '';
    value = JSON.parse(value);
    return value;
  } catch (err) {
    return '';
  }
}

export function setlocalStorage(key, val) {
  if (!key) return;
  try {
    let value = val;
    if (typeof val !== 'string') {
      value = JSON.stringify(val);
    }
    localStorage.setItem(key, value);
  } catch (err) {
    // 写失败之后处理
  }
}
