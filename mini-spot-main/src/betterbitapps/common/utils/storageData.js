
import { Env } from '@region-lib/env';
import { guid as Guid } from '@unified/helpers';
import { addCookie, getCookie, storage } from 'by-storage';
import { LANG_KEY, LANGUAGES, getLanguage } from '@region-lib/language';
import { FILTER_LANGUAGE_MAP } from 'common/packages-biz/global-settings/usdt-settings';
import { isDex } from 'common/utils/env';

const { TOKEN_KEY, COOKIE_DOMAIN, GUID_KEY } = Env;

export function getToken() {

  let formate_TOKEN_KEY=TOKEN_KEY;
  if(isDex){
    formate_TOKEN_KEY=TOKEN_KEY.replace('better-1','better-dex-1')
  }
  return getCookie(formate_TOKEN_KEY);
}

export function setToken(token) {
  addCookie(TOKEN_KEY, token, COOKIE_DOMAIN, '/', 10080); // 有效期 7天
}

export function getGuid() {
  let guid = getCookie(GUID_KEY);
  if (!guid || guid.length !== 36) {
    guid = Guid();
  }
  addCookie(GUID_KEY, guid, COOKIE_DOMAIN, '/', 120 * 24 * 60);

  return guid;
}

export function getLang() {
  return getLanguage();
}

export function setLang(lang) {
  storage.set(LANG_KEY, lang);
  addCookie(LANG_KEY, lang, COOKIE_DOMAIN, '/', 24 * 60);
}

// eslint-disable-next-line consistent-return
export function getLocalStorage(key) {
  if (!key) return '';
  let value = localStorage.getItem(key) || '';
  try {
    value = JSON.parse(value);
    return value;
  } catch {
    return value;
  }
}

export function setLocalStorage(key, val) {
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
